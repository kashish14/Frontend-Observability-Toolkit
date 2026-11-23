# Frontend Observability Toolkit — Project Structure

## Repository Layout

```
frontend-observability-toolkit/
├── docs/                    # Product and technical documentation
├── sdk/                     # Frontend Observability SDK (TypeScript)
├── dashboard/               # Angular SPA for visualization
├── analytics-engine/        # Metrics processing, patterns, anomalies, insights
├── mock-backend/            # Node.js ingest API + analytics wiring
├── tests/                   # Shared and cross-cutting tests
├── package.json             # Root workspace config
└── README.md
```

---

## Module Purposes

### `docs/`
- **Purpose:** Single source of truth for product vision, architecture, and decisions.
- **Contents:** `product-vision.md`, `architecture.md`, `decision-log.md`, `structure.md`, and any API or runbooks.
- **Consumers:** Engineers, product, and new contributors.

### `sdk/`
- **Purpose:** Lightweight, modular SDK embedded in Angular (or other) apps to collect render, event, friction, and anomaly signals.
- **Responsibilities:**
  - Component render tracking (init, render, destroy, custom marks).
  - Event monitoring (DOM, router, custom).
  - UX friction detection (rage click, dead click, hesitation).
  - Anomaly detection hooks (errors, long tasks, custom).
  - Performance timing (LCP, FCP, TTI, custom).
  - Batching, throttling, and sending to ingest API.
- **Output:** Canonical events sent to ingest (e.g. POST /api/events).
- **Key traits:** Modular, observable (RxJS), extensible, minimal overhead.

### `dashboard/`
- **Purpose:** Angular SPA that visualizes frontend health: performance trends, anomaly alerts, session insights, friction metrics.
- **Responsibilities:**
  - Consume visualization API (e.g. GET /api/insights, /api/metrics).
  - Render charts (performance over time, funnel, distributions).
  - Display anomaly and friction lists; optional drill-down.
  - Modular UI (feature modules, reusable chart and metric components).
- **Output:** Human-readable dashboards for engineers and product.
- **Key traits:** Modular Angular architecture, responsive, accessible.

### `analytics-engine/`
- **Purpose:** Process raw events and metrics into aggregates, patterns, anomalies, and insights for the dashboard and alerting.
- **Responsibilities:**
  - Aggregate UI metrics by time window, route, component.
  - Pattern detection (e.g. funnel steps, drop-off).
  - Anomaly detection (thresholds, simple statistical baselines).
  - Insight generation (e.g. “LCP degraded on /checkout”).
  - Expose visualization-ready data via API or in-memory for mock backend.
- **Output:** Structured data for dashboard (and future alerting).
- **Key traits:** Stateless where possible, configurable rules, testable.

### `mock-backend/`
- **Purpose:** Node.js server that implements the ingest and visualization API contract so the SDK and dashboard can run end-to-end without production infra.
- **Responsibilities:**
  - Accept POST /api/events (and optionally /api/metrics).
  - Store events in memory (or simple persistence for demo).
  - Invoke analytics engine to compute aggregates and insights.
  - Expose GET /api/insights, /api/metrics, /api/sessions (or equivalent).
  - CORS, health check, optional seed/dummy data.
- **Output:** Running server that SDK and dashboard call.
- **Key traits:** Same API contract as production, easy to run locally.

### `tests/`
- **Purpose:** Cross-cutting and integration tests that span modules (e.g. SDK → ingest contract, analytics → API output).
- **Contents:**
  - Contract tests for ingest and visualization APIs.
  - Integration tests for SDK + mock backend or analytics + backend.
  - Performance tests for SDK (overhead, batch size).
- **Unit tests** for SDK and analytics engine typically live next to source (`*.spec.ts`); `tests/` holds shared fixtures and multi-module tests.

---

## Data Flow (Recap)

1. **App** (instrumented with **SDK**) → events to **mock-backend** (ingest).
2. **Mock-backend** → persists events, calls **analytics-engine** → stores or serves results.
3. **Dashboard** → GET from **mock-backend** (visualization API) → renders charts and tables.
4. **tests/** → validate contract and behavior across SDK, backend, and analytics.

---

## Build and Run Order

1. **Install:** `npm install` from the repo root (npm workspaces). A `postinstall` step builds `sdk` and `analytics-engine` so their `dist/` output exists for the packages that import them.
2. **Full stack:** `npm run dev` builds the mock backend, then runs it together with the dashboard in live mode. The dashboard itself is instrumented with the SDK, so browsing it generates events.
3. **Dashboard only:** `npm start` serves the dashboard with in-app demo data (no backend).
4. **Tests:** `npm test` from root, or `npm run test --workspace=<name>`.

This structure keeps concerns separated, supports incremental development, and allows the mock backend and analytics engine to be replaced by production services without changing SDK or dashboard contracts.
