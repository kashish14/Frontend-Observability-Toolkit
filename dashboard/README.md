# Frontend Observability Toolkit — Dashboard

Production-grade Angular application for frontend observability: component render tracking, UX friction detection, session analytics, and dashboard visualizations.

---

## Product Overview

The **Frontend Observability Toolkit** turns the frontend into a first-class observable system:

- **Component render tracking** — Init, render, and destroy timing via `PerformanceTrackingService` and SDK integration.
- **UX friction detection** — Rage clicks, repeated navigation, long loading, abandoned actions via `FrictionDetectionService`.
- **Session analytics** — Aggregated metrics, anomaly detection, and insights (mock data in-app; pluggable backend).
- **Dashboard UI** — Performance charts, anomaly alerts, interaction heatmap simulation, friction metrics, event logs.
- **Modular architecture** — Sidebar layout, lazy-loaded feature routes, shared services (event bus, analytics, performance, logging).
- **Mock backend** — In-app HTTP interceptor returns simulated analytics so the app runs with **`npm install`** and **`ng serve`** only.

---

## How to Run Locally

```bash
# From the dashboard directory (or repo root with workspaces)
cd dashboard
npm install
ng serve
```

Open **http://localhost:4200**. The app uses an in-app mock API (no separate Node backend required).

- **Dashboard** — Landing with KPIs and quick links.
- **Overview** — Events, insights, sessions, performance trend chart, heatmap simulation, recent insights.
- **Performance** — Metrics table (P50/P95), P95 distribution chart.
- **Anomalies** — Detected anomalies list.
- **Sessions** — Session table (event/friction/error counts, LCP, time range).
- **Friction** — Friction totals and sessions-by-friction table.
- **Event Logs** — Observability event stream (info/warn/error from logging service).

---

## Architecture

### Application shell

- **Layout** — Sidebar navigation + header + main content; single `<router-outlet>` for child routes.
- **Routing** — Lazy-loaded feature modules: dashboard, overview, performance, anomalies, sessions, friction, logs.

### Observability SDK integration

- **ObservabilitySdkService** — Wires router (navigation events), performance tracking (render marks), friction detection (clicks), and event bus. Injected in `LayoutComponent` so it initializes on load.
- **PerformanceTrackingService** — `markStart` / `markEnd` per component; exposes `timings$` stream.
- **FrictionDetectionService** — `recordClick` (rage click), `recordNavigation` (repeated nav), `startLoading` / `endLoading` (long loading), `recordAbandonedAction`; emits `FrictionInsight` and logs.
- **EventBusService** — App-wide event stream (`render`, `click`, `navigation`, `friction`, `anomaly`, `performance`, `error`).
- **LoggingService** — In-memory log entries (info/warn/error/debug); consumed by Event Logs page and global error handler.

### Session analytics

- **ObservabilityApiService** — HTTP client for `/api/metrics`, `/api/insights`, `/api/sessions`, `/api/anomalies`, `/api/events/summary`.
- **MockBackendService** — Provides mock data for those endpoints.
- **mockApiInterceptor** — Intercepts `/api/*` and returns mock responses (async with delay) so no external server is needed.

### Error handling

- **GlobalErrorHandler** — Catches errors, logs via `LoggingService`, emits via `EventBusService` (`error` type).

### Environment

- **environment.ts** — `production: false`, `enableMockBackend: true`, `logLevel: 'debug'`.
- **environment.prod.ts** — `production: true`, `enableMockBackend: false`, `logLevel: 'warn'`.

---

## SDK Design

- **Component render** — Call `performance.markStart(componentId)` in constructor/ngOnInit and `performance.markEnd(componentId, 'render')` after view init (or use a directive).
- **Clicks** — Call `sdk.trackClick(target)` on nav/item clicks; feeds friction detection (rage click).
- **Navigation** — SDK subscribes to `Router.events` (NavigationEnd) and records route + friction (repeated nav).
- **Loading** — Call `sdk.startLoading()` before async work and `sdk.endLoading()` after; long duration triggers friction insight.
- **Events** — Use `EventBusService.emit(type, payload)` for custom events; use `LoggingService` for audit/debug.

All streams are RxJS observables for cross-module communication and testability.

---

## Dashboard Explanation

- **Performance charts** — Line chart (LCP/FCP P95 over time) and bar chart (P95 distribution) via Chart.js; data from mock metrics.
- **Anomaly alerts** — List of threshold/error-rate anomalies from mock anomalies.
- **Interaction heatmap** — Simulated grid (random intensity) to illustrate heatmap visualization; can be wired to real click/position data later.
- **Friction metrics** — Total friction events and sessions with friction; table of sessions by friction count.
- **Event logs** — Tail of `LoggingService` entries (navigation, friction, errors). Navigate and click to generate events.

---

## Scalability Principles

- **Modular routing** — Lazy-loaded features keep initial bundle small.
- **Shared services** — Single instances (event bus, analytics, performance, logging) for consistent state and cross-feature communication.
- **Mock backend** — Same API contract as a real backend; swap interceptor for real HTTP in production.
- **Environment config** — Dev vs prod (mock on/off, log level) without code changes.
- **Observable streams** — Backpressure-friendly; easy to add sampling, batching, or a real ingest pipeline later.

---

## Roadmap

- **v1** — In-app mock, sidebar layout, SDK integration, friction detection, global error handler, event logs, heatmap simulation.
- **v1.1** — Render timing directive for components; optional real backend (Node or serverless) behind environment flag.
- **v2** — Real click/position heatmap; performance tracing UI; alerting (e.g. Slack) from anomalies.
- **Ongoing** — E2E tests; performance budgets; optional OpenTelemetry bridge.

---

## Testing

- **Unit tests** — `LoggingService`, `EventBusService`, `MockBackendService` (see `*.spec.ts` next to services).
- Run: `ng test`.

---

*Built with Angular 17+, TypeScript, RxJS, Chart.js. Run with `npm install` and `ng serve`.*
