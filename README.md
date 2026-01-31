# Frontend Observability Toolkit

**Production-grade observability for the frontend: SDK, analytics engine, and dashboard.**

This toolkit helps developers **monitor UI performance**, **detect UX friction**, **analyze session anomalies**, and **visualize frontend health metrics**—with a modular, documentation-first design and staff-level engineering practices.

---

## Product Overview

Modern applications have strong backend observability (logs, traces, metrics) but the **frontend—where users actually interact—often remains a black box.** The Frontend Observability Toolkit closes that gap:

- **Lightweight SDK** — Drop-in instrumentation for Angular (and extensible to other frameworks): render tracking, event monitoring, friction detection, and performance timing.
- **Analytics Engine** — Processes raw events into aggregates, patterns, anomalies, and insights; prepares data for dashboards and alerting.
- **Visualization Dashboard** — Single pane of glass for performance trends, anomaly alerts, session insights, and friction metrics.

**Core promise:** Know how your UI performs in the wild, where users struggle, and when something breaks—before support tickets pile up.

---

## Run the Angular app locally

The dashboard is a **fully runnable Angular application** with in-app mock API (no separate Node server required):

```bash
cd dashboard
npm install
ng serve
```

Open **http://localhost:4200**. You get:

- **Application shell** — Sidebar navigation, header, dashboard landing.
- **Observability SDK** — Component render tracking, click/navigation events, UX friction detection (rage clicks, repeated nav, long loading).
- **Session analytics** — Mock metrics, anomalies, insights, sessions.
- **Dashboard UI** — Performance charts, anomaly alerts, interaction heatmap simulation, friction metrics, event logs.
- **Shared services** — Event bus, analytics, performance tracking, logging; global error handler; environment configs.

See **[dashboard/README.md](dashboard/README.md)** for dashboard-specific architecture, SDK design, and scalability.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  CONSUMING APP (Angular)                                         │
│  Components / Router / Services  →  FRONTEND OBSERVABILITY SDK   │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  INGESTION (Mock Backend / Production API)                        │
│  POST /api/events  →  Store  →  ANALYTICS ENGINE                 │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD (Angular SPA)                                          │
│  GET /api/insights, /api/metrics, /api/sessions  →  Charts & UI   │
└─────────────────────────────────────────────────────────────────┘
```

- **SDK:** Modular (render, events, friction, anomaly, performance); observable (RxJS); non-blocking batching and send.
- **Analytics Engine:** Aggregation by time/route/component; threshold and simple statistical anomaly detection; insight generation; session summarization.
- **Dashboard:** Angular 17+ standalone components; Chart.js (ng2-charts); feature modules for Overview, Performance, Anomalies, Sessions, Friction.

See **[docs/architecture.md](docs/architecture.md)** for high-level design, data flow, scalability, and privacy.

---

## SDK Usage Guide

### Installation

From the repo root (or with the SDK published as a package):

```bash
npm install
cd sdk && npm run build
```

In your Angular app, point to the built SDK or copy the `sdk` package and ensure `rxjs` is a peer dependency.

### Quick Start

```typescript
import { ObservabilitySDK } from '@frontend-observability/sdk';

// Initialize once (e.g. in main.ts or AppComponent constructor)
const sdk = ObservabilitySDK.init({
  endpoint: 'https://your-ingest.example.com/api/events',
  sampleRate: 1,
  enabledModules: { render: true, events: true, friction: true, anomaly: true, performance: true },
  batchSize: 10,
  flushIntervalMs: 5000,
});

// Set route when navigation changes (e.g. in Angular router subscription)
sdk.setRoute('/dashboard');

// Track component render
sdk.trackRender('ProductListComponent', 'render', 15, { route: '/products' });

// Track custom event
sdk.trackEvent('checkout_started', { step: 1 });

// Stream of all metric events (for custom piping)
sdk.getMetrics$().subscribe((event) => { /* ... */ });

// Friction stream
sdk.getFriction$().subscribe((event) => { /* ... */ });
```

### Angular Integration

- Call `ObservabilitySDK.init(config)` in `main.ts` or a root provider.
- Subscribe to `Router.events` and call `sdk.setRoute(route.urlAfterRedirects)` on `NavigationEnd`.
- In components: use `sdk.trackRender(componentId, 'init' | 'render' | 'destroy', durationMs)` in lifecycle hooks or a directive.
- For performance: call `sdk.performanceTiming.captureLCP()` / `captureFCP()` after app stabilizes (e.g. `afterNextRender` or timeout).

### API Surface

| Method | Description |
|--------|-------------|
| `ObservabilitySDK.init(config)` | Initialize SDK (singleton). |
| `sdk.trackRender(componentId, phase, durationMs?, metadata?)` | Track render lifecycle. |
| `sdk.trackEvent(type, payload?)` | Track custom event. |
| `sdk.setRoute(route)` | Set current route for context. |
| `sdk.getMetrics$()` | Observable of all metric events. |
| `sdk.getFriction$()` | Observable of friction events. |
| `sdk.destroy()` | Flush queue and tear down. |

---

## Dashboard

The Angular dashboard shows:

- **Overview** — Total events, insights count, sessions, metric series; performance trend chart (LCP/FCP P95); recent insights list.
- **Performance** — Metrics table (P50/P95 by type); P95 distribution over time (bar chart).
- **Anomalies** — List of detected anomalies (threshold, error rate) with severity and timestamps.
- **Sessions** — Session table: session ID, route, event/friction/error counts, LCP, time range.
- **Friction** — Total friction events, sessions with friction, table of sessions by friction count.

### Running the Dashboard

1. **Start the mock backend** (ingest + analytics):

   ```bash
   npm run start:backend
   ```

   Backend runs at `http://localhost:3000`. It seeds dummy data and exposes `POST /api/events`, `GET /api/insights`, `/api/metrics`, `/api/anomalies`, `/api/sessions`, `/api/events/summary`, `GET /health`.

2. **Start the dashboard** (with proxy to backend):

   ```bash
   npm run start:dashboard
   ```

   Dashboard runs at `http://localhost:4200` and proxies `/api` to `http://localhost:3000`.

3. Open `http://localhost:4200` and navigate Overview, Performance, Anomalies, Sessions, Friction.

### Dashboard Screenshots (Placeholders)

| View | Description |
|------|-------------|
| **Overview** | KPI cards (events, insights, sessions, metrics), performance trend line chart, recent insights list. |
| **Performance** | Table of P50/P95 by metric; bar chart of P95 over time. |
| **Anomalies** | List of anomalies with severity badges and timestamps. |
| **Sessions** | Table of sessions with event/friction/error counts and LCP. |
| **Friction** | Friction totals and session-level friction table. |

*(Add real screenshots under `docs/screenshots/` or in the repo wiki.)*

---

## Scalability Considerations

- **SDK:** Single-page scope; multiple tabs = multiple instances. Session ID can be shared via `sessionStorage` for cross-tab correlation. Batch size and flush interval tune volume vs. latency.
- **Ingest:** Stateless API; scale horizontally. Add a queue (e.g. Redis/SQS) in front of workers for durability and backpressure.
- **Analytics Engine:** Runs as a library inside the mock backend; can be deployed as a separate service. For high scale, use batch jobs for heavy aggregation and stream processing for real-time alerts.
- **Dashboard:** Static SPA + API; cache aggregation results by time range to limit load on the engine.
- **Storage:** Production should use an event store (e.g. ClickHouse, BigQuery) and metrics store (e.g. TimescaleDB, Prometheus). Mock uses in-memory storage with optional persistence.

---

## Testing Strategy

- **Unit tests:** SDK (`sdk/*.spec.ts`) and analytics engine (`analytics-engine/*.spec.ts`) with Jest.
- **Integration tests:** Ingest and visualization API contract (`tests/integration/ingest-contract.spec.ts`). Run with mock backend up: `API_BASE=http://localhost:3000 npm run test --workspace=tests`.
- **Performance tests:** Conceptual SDK overhead test in `tests/performance/sdk-overhead.spec.ts`; extend with browser-based LCP/CPU benchmarks as needed.
- **Dashboard:** Angular unit test for `AppComponent`; add more component tests and E2E (e.g. Cypress) as needed.

```bash
npm test                    # All workspaces
npm run test --workspace=sdk
npm run test --workspace=analytics-engine
npm run test --workspace=tests
npm run test --workspace=dashboard
```

---

## Roadmap

- **v1 (current):** SDK (render, events, friction, anomaly, performance), analytics engine (aggregation, threshold/heuristic anomaly, insights, sessions), mock backend, Angular dashboard, docs, unit + contract tests.
- **v1.1:** Angular directive/decorator for automatic render tracking; optional session replay hooks (privacy-preserving).
- **v2:** Configurable ML-based anomaly detection; alerting (Slack, PagerDuty); production backend reference (e.g. Node + ClickHouse).
- **Ongoing:** Performance budgets in CI; SDK for React/Vue; OpenTelemetry bridge.

---

## Engineering Philosophy

- **Documentation first** — Product vision, architecture, and decision log before or alongside code. See [docs/product-vision.md](docs/product-vision.md), [docs/architecture.md](docs/architecture.md), [docs/decision-log.md](docs/decision-log.md).
- **Separation of concerns** — SDK collects; engine processes; dashboard visualizes. Clear API contracts between layers.
- **Modularity** — Pluggable SDK modules; feature-based dashboard; engine functions composable.
- **Observability hooks** — The toolkit itself is observable (configurable logging, metrics for dropped events/send errors).
- **Privacy by default** — No PII in default config; sampling and retention documented; consent levels supported in design.
- **Senior-level quality** — Reusable services, performance-conscious design, test coverage, and scalable patterns.

---

## Repository Structure

| Path | Purpose |
|------|---------|
| `docs/` | Product vision, architecture, decision log, structure. |
| `sdk/` | Frontend Observability SDK (TypeScript, RxJS). |
| `dashboard/` | Angular SPA for visualization. |
| `analytics-engine/` | Metrics aggregation, anomaly detection, insights, sessions. |
| `mock-backend/` | Node.js ingest + visualization API with dummy data. |
| `tests/` | Integration and performance tests. |

---

## Quick Start (Full Stack)

```bash
# Install dependencies (from repo root)
npm install

# If dashboard build fails with Angular version errors, do a clean install:
# rm -rf node_modules package-lock.json && npm install

# Build SDK and analytics engine (required for mock-backend)
npm run build:sdk
npm run build:analytics
npm run build:backend

# Terminal 1: start mock backend
npm run start:backend

# Terminal 2: start dashboard (proxies /api to http://localhost:3000)
npm run start:dashboard
```

Then open **http://localhost:4200**. The backend seeds dummy data so the dashboard shows performance trends, insights, sessions, and friction metrics out of the box.

---

## License

MIT (or your chosen license).

---

*Built with Angular, TypeScript, RxJS, Node.js, and Chart.js. Designed for production frontend observability.*
