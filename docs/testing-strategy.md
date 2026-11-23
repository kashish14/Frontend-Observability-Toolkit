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
- **Run:** `npm run test --workspace=sdk`.

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
- **Runner:** Karma + Jasmine in headless Chrome.
- **Location:** `dashboard/src/**/*.spec.ts`.
- **Run:** `npm run test --workspace=dashboard`.

**Examples:**
- `app.component.spec.ts` — AppComponent creates; layout renders the sidebar navigation.

---

## Integration Tests

### Contract tests (`tests/integration/`)

- **Scope:** Ingest and visualization API contract (POST /api/events, GET /api/insights, /api/metrics, /api/anomalies, /api/sessions, /health), plus an end-to-end check that events tracked by the SDK reach the analytics output.
- **Runner:** Jest. The mock backend is started in-process on a random port, so nothing needs to be running beforehand.
- **Run:** `npm run test --workspace=tests`.

**Examples:**
- `ingest-contract.spec.ts` — POST /api/events accepts SDK-shaped payload; GET endpoints return arrays; /health returns ok; SDK → backend → `/api/events/summary`, `/api/sessions`, `/api/metrics`.

---

## Performance Tests

### Conceptual overhead test (`tests/performance/`)

- **Scope:** Sanity check that tracking 1,000 events through the SDK (context, queue, stream) takes under 100 ms.
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
npm run test --workspace=sdk
npm run test --workspace=analytics-engine
npm run test --workspace=dashboard
npm run test --workspace=tests
```

---

## Coverage and CI

- **Coverage:** SDK and analytics-engine use Jest `collectCoverageFrom`; enable coverage reporting in CI with `jest --coverage`.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, `npm run build` and `npm test` on Node 22.

---

## Summary

| Layer        | Location              | Runner   | Prerequisite      |
|-------------|------------------------|----------|-------------------|
| Unit (SDK)  | sdk/src/*.spec.ts      | Jest     | —                 |
| Unit (Engine) | analytics-engine/src/*.spec.ts | Jest | —                 |
| Unit (Dashboard) | dashboard/src/*.spec.ts | Karma   | —                 |
| Integration | tests/integration/*.spec.ts | Jest | —                 |
| Performance | tests/performance/*.spec.ts | Jest | —                 |

This strategy keeps feedback fast (unit tests), validates API contracts (integration), and leaves room for real performance benchmarks as the product matures.
