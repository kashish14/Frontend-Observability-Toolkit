# Frontend Observability Toolkit — Testing Strategy

## Overview

Testing is organized in three layers: **unit**, **integration**, and **performance**, with tests colocated where possible and shared contract tests in `tests/`.

---

## Unit Tests

### SDK (`sdk/`)

- **Scope:** Collector, Transport, RenderTracker, EventMonitor, FrictionDetector, AnomalyHooks, PerformanceTiming, context.
- **Runner:** Jest.
- **Location:** `sdk/src/**/*.spec.ts`.
- **Setup:** `jest-setup.ts` mocks `sessionStorage` and `fetch` so tests run in Node.
- **Run:** `npm run test:sdk` or `npm run test --workspace=sdk`.

**Examples:**
- `collector.spec.ts` — emit attaches context and forwards to transport; stream receives events.
- `render-tracker.spec.ts` — trackRender and markStart/markEnd produce render events.

### Analytics Engine (`analytics-engine/`)

- **Scope:** Aggregator, anomaly detector, insights generator, session summarizer, `processEvents`.
- **Runner:** Jest.
- **Location:** `analytics-engine/src/**/*.spec.ts`.
- **Run:** `npm run test --workspace=analytics-engine`.

**Examples:**
- `aggregator.spec.ts` — aggregateMetrics produces P50/P95 by metric and period.
- `index.spec.ts` — processEvents returns aggregates, anomalies, insights, sessions.

### Dashboard (`dashboard/`)

- **Scope:** Components, services, routing.
- **Runner:** Karma + Jasmine (Angular default).
- **Location:** `dashboard/src/**/*.spec.ts`.
- **Run:** `npm run test --workspace=dashboard`.

**Examples:**
- `app.component.spec.ts` — AppComponent creates and shows toolbar title.

---

## Integration Tests

### Contract tests (`tests/integration/`)

- **Scope:** Ingest and visualization API contract (POST /api/events, GET /api/insights, /api/metrics, /api/sessions, /health).
- **Runner:** Jest.
- **Prerequisite:** Mock backend running at `http://localhost:3000` (or set `API_BASE`).
- **Run:** `npm run test --workspace=tests` (start backend in another terminal first).

**Examples:**
- `ingest-contract.spec.ts` — POST /api/events accepts SDK-shaped payload; GET endpoints return arrays; /health returns ok.

---

## Performance Tests

### Conceptual overhead test (`tests/performance/`)

- **Scope:** Sanity check that high-volume event emission completes within a time budget (e.g. 100 events in &lt; 50 ms).
- **Runner:** Jest.
- **Run:** `npm run test --workspace=tests` (includes performance folder).

**Future:** Browser-based LCP/CPU benchmarks with and without SDK; run in CI or manually.

---

## Running All Tests

From repo root:

```bash
npm test
```

This runs tests in all workspaces that define a `test` script (sdk, analytics-engine, dashboard, tests).

Per-workspace:

```bash
npm run test:sdk
npm run test --workspace=analytics-engine
npm run test --workspace=dashboard
npm run test --workspace=tests
```

---

## Coverage and CI

- **Coverage:** SDK and analytics-engine use Jest `collectCoverageFrom`; enable coverage reporting in CI with `jest --coverage`.
- **CI:** Run `npm install`, `npm run build`, then `npm test`. For integration tests, start the mock backend before running the tests workspace (or use a CI job that runs the backend in the background).

---

## Summary

| Layer        | Location              | Runner   | Prerequisite      |
|-------------|------------------------|----------|-------------------|
| Unit (SDK)  | sdk/src/*.spec.ts      | Jest     | —                 |
| Unit (Engine) | analytics-engine/src/*.spec.ts | Jest | —                 |
| Unit (Dashboard) | dashboard/src/*.spec.ts | Karma   | —                 |
| Integration | tests/integration/*.spec.ts | Jest | Backend running   |
| Performance | tests/performance/*.spec.ts | Jest | —                 |

This strategy keeps feedback fast (unit tests), validates API contracts (integration), and leaves room for real performance benchmarks as the product matures.
