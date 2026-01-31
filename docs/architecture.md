# Frontend Observability Toolkit — Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONSUMING APPLICATION (Angular)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Components │  │   Router    │  │   Services  │  │  Custom Instrument  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                     │           │
│         └────────────────┴────────────────┴─────────────────────┘           │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND OBSERVABILITY SDK                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │   Render    │ │   Event     │ │   Friction  │ │    Anomaly      │  │  │
│  │  │   Tracker   │ │   Monitor   │ │   Detector  │ │    Hooks        │  │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └────────┬────────┘  │  │
│  │         │               │               │                 │           │  │
│  │         └───────────────┴───────────────┴─────────────────┘           │  │
│  │                                    │                                   │  │
│  │                         ┌──────────▼──────────┐                        │  │
│  │                         │   Core / Collector  │                        │  │
│  │                         │   (batch, throttle) │                        │  │
│  │                         └──────────┬──────────┘                        │  │
│  └────────────────────────────────────┼───────────────────────────────────┘  │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INGESTION (Mock Backend)                           │
│  POST /api/events  │  POST /api/metrics  │  Health / CORS                    │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ANALYTICS ENGINE                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Aggregation│  │   Pattern   │  │   Anomaly   │  │   Insights          │  │  │
│  │  & Storage  │  │   Detection │  │   Detection │  │   Generation        │  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         └────────────────┴────────────────┴────────────────────┘             │
│                                    │                                         │
│                         ┌──────────▼──────────┐                              │
│                         │   Visualization     │                              │
│                         │   Data API          │                              │
│                         └──────────┬──────────┘                              │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD (Angular SPA)                            │
│  Performance Trends │ Anomaly Alerts │ Session Insights │ Friction Metrics  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend SDK Design

### Principles

- **Modular:** Each capability (render, events, friction, anomaly) is a pluggable module; consumers can enable only what they need.
- **Observable:** Internal and external APIs use RxJS `Observable`s for streams of metrics and events; easy to pipe into custom logic.
- **Extensible:** Custom dimensions, event types, and collectors via a small public API; no forking required.
- **Non-blocking:** All collection and send logic is async; no work on the critical path that blocks rendering.

### Core Abstractions

| Abstraction | Responsibility |
|-------------|----------------|
| **Collector** | Receives raw signals (e.g. render end, click), normalizes to a canonical event shape, optionally enriches. |
| **Transport** | Batches events and sends to ingest endpoint; handles retries, sampling, and backoff. |
| **Config** | Endpoint, sampling rate, enabled modules, PII rules, and feature flags. |
| **Context** | Session ID, view/route, user segment (non-PII); attached to every event. |

### Module Boundaries

- **Render Tracker:** Uses Angular lifecycle or zone hooks to record component init/render/destroy and custom marks.
- **Event Monitor:** Listens to DOM/router events (or app-provided streams), normalizes to events with type and payload.
- **Friction Detector:** Consumes event stream; detects rage click, dead click, scroll thrash, hesitation; emits friction events.
- **Anomaly Hooks:** Places to plug in custom logic (e.g. error rate spike, long task); emits anomaly events for the engine.

### Public API Surface

- `ObservabilitySDK.init(config)`
- `ObservabilitySDK.trackRender(componentId, duration, metadata)`
- `ObservabilitySDK.trackEvent(type, payload)`
- `ObservabilitySDK.getMetrics$(): Observable<MetricEvent>`
- `ObservabilitySDK.getFriction$(): Observable<FrictionEvent>`
- Optional: decorators or directives for Angular components (e.g. `ObserveRender`).

---

## Data Flow

1. **Application** emits signals (render, click, route, custom).
2. **SDK** normalizes → attaches context (session, route) → optionally runs friction/anomaly logic → passes to **Collector**.
3. **Collector** batches and throttles → **Transport** sends to **Ingest API** (e.g. POST /api/events).
4. **Mock Backend** persists raw events (in-memory or simple file/DB for demo).
5. **Analytics Engine** periodically or on-demand:
   - Aggregates by time window, route, component.
   - Runs pattern detection (e.g. funnel steps).
   - Runs anomaly detection (e.g. threshold, simple statistical).
   - Generates insights (e.g. “LCP degraded on /checkout”).
6. **Dashboard** calls **Visualization Data API** (e.g. GET /api/insights, /api/metrics) and renders charts and tables.

---

## Scalability Model

- **SDK:** Single-page scope; multiple tabs = multiple SDK instances; session ID can be shared via storage for cross-tab correlation if needed.
- **Ingest:** Stateless; horizontal scaling of API servers; queue (e.g. Redis/SQS) in front of workers for durability and backpressure.
- **Analytics Engine:** Can run as a separate service; batch jobs for heavy aggregation; real-time path for critical alerts (e.g. stream processing).
- **Dashboard:** Static SPA + API; cache aggregation results (e.g. by time range) to limit load on the engine.
- **Storage:** For production, event store (e.g. ClickHouse, BigQuery) and aggregated metrics (e.g. TimescaleDB, Prometheus); mock can use in-memory or SQLite.

---

## Observability Design

- **The toolkit observes the frontend;** it should itself be observable:
  - SDK: optional debug mode logging; metrics for “events dropped”, “send errors”.
  - Backend: request logs, latency, error rates.
  - Analytics: job duration, records processed, anomaly counts.
- **Structured logging** and **trace IDs** (request or batch) help correlate SDK → ingest → engine → dashboard.
- **Health endpoints** for ingest and analytics so orchestrators can probe liveness/readiness.

---

## Privacy Considerations

- **PII:** No collection of PII by default; configurable allow-list for fields that may contain PII; redaction or hashing before send.
- **Sampling:** Configurable global and per-event-type sampling to reduce volume and exposure.
- **Retention:** Configurable TTL for raw events and aggregates; documented for compliance (e.g. GDPR).
- **Consent:** SDK can accept a “consent level” (e.g. none, analytics, full); behavior (e.g. no send vs. sampled send) documented and implemented accordingly.
- **In-app disclosure:** Dashboard and docs recommend in-app privacy notices and consent flows where required.

---

## Summary

The architecture is **three-tier:** **SDK (collect)** → **Ingest + Analytics Engine (process)** → **Dashboard (visualize)**. The **SDK** is modular and observable; the **engine** turns raw metrics into patterns, anomalies, and insights; the **dashboard** provides a single pane of glass. **Scalability** is addressed via stateless ingest, batch/stream analytics, and caching; **observability** of the toolkit itself and **privacy** (no PII by default, sampling, retention) are first-class design concerns.
