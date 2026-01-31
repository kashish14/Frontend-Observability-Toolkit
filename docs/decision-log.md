# Frontend Observability Toolkit — Decision Log

This log records material technical and product decisions, trade-offs, and rationale so future contributors and stakeholders can understand the “why” behind the design.

---

## 1. Documentation-First Approach

**Decision:** Define product vision, architecture, and decision log before or in parallel with implementation.

**Rationale:**
- Aligns implementation with product goals and prevents scope creep.
- Gives new contributors a single source of truth for context and constraints.
- Forces clarity on boundaries (SDK vs. engine vs. dashboard) and data contracts.
- Reduces rework when requirements are written down and reviewed early.

**Trade-offs:** Slight delay before “visible” code; maintained only if we treat docs as living artifacts (e.g. update on major changes).

---

## 2. Modular SDK Over Monolithic Agent

**Decision:** Build the SDK as a set of composable modules (render, events, friction, anomaly) with a thin core (collector + transport) rather than a single monolithic agent.

**Rationale:**
- Teams can enable only what they need (e.g. performance only, no friction), reducing payload and compliance surface.
- Easier to test and evolve each capability independently.
- Aligns with “pay for what you use” and tree-shaking in bundlers.
- Allows future replacement of a module (e.g. custom friction logic) without replacing the whole SDK.

**Trade-offs:** More surface area in the public API and configuration; need clear docs and defaults so “full experience” is still one-line.

---

## 3. RxJS for Streams and Async

**Decision:** Use RxJS as the primary abstraction for metric and event streams inside the SDK and in the dashboard.

**Rationale:**
- Angular ecosystem is RxJS-native; consistent with existing codebases and team skills.
- Friction and anomaly logic are naturally stream-based (events in → derived events out).
- Composition (map, filter, debounce, buffer) fits batching and throttling needs.
- Testability: streams can be mocked and advanced with TestScheduler or marbles.

**Trade-offs:** Learning curve for contributors unfamiliar with RxJS; we mitigate with small, well-named operators and docs.

---

## 4. In-Process Analytics Engine (Initial) vs. Separate Service

**Decision:** Ship the analytics engine as a Node.js module that can run in the same process as the mock backend (or as a separate service) with the same interface.

**Rationale:**
- Simplifies local and demo setup: one `npm run backend` for ingest + analytics.
- Same code path can be deployed as a separate microservice when scaling.
- Clear API boundary (HTTP or internal calls) so swapping deployment topology does not change SDK or dashboard.

**Trade-offs:** For very high scale, a dedicated stream/batch pipeline may be needed; the current design does not preclude that.

---

## 5. Event Shape: Canonical Payload + Context

**Decision:** All events share a canonical envelope: `type`, `timestamp`, `payload`, and a `context` object (sessionId, route, view, environment).

**Rationale:**
- Simplifies ingestion and storage (one schema or table with a JSON payload).
- Analytics and dashboard can filter/group by context without parsing many event-specific schemas.
- Extensibility: new event types add new `type` and `payload` fields without changing the envelope.

**Trade-offs:** Slightly larger payload than type-specific minimal structs; compression and batching offset this.

---

## 6. Friction Detection Heuristics (Rule-Based Initially)

**Decision:** Implement friction detection with rule-based heuristics (e.g. N clicks in M ms = rage click, click on non-interactive = dead click) rather than ML in v1.

**Rationale:**
- Predictable and explainable; easier to tune and document.
- No training data or model pipeline required for launch.
- ML can be added later as a separate module that consumes the same event stream and augments or overrides heuristics.

**Trade-offs:** May miss nuanced patterns; we accept this for v1 and document it as a known limitation.

---

## 7. Anomaly Detection: Thresholds + Simple Statistics

**Decision:** Implement anomaly detection using configurable thresholds (e.g. error rate &gt; X%) and simple statistical baselines (e.g. rolling mean ± k standard deviations) rather than complex ML.

**Rationale:**
- Fast to implement and reason about; good for demos and early adopters.
- Sufficient for many frontend signals (e.g. LCP spike, error rate jump).
- Foundation for later replacing or supplementing with ML-based detectors.

**Trade-offs:** May generate false positives/negatives in noisy or non-stationary series; we document tuning and plan iteration.

---

## 8. Angular for Dashboard Only (SDK Framework-Agnostic Core)

**Decision:** Build the dashboard in Angular; keep the SDK core framework-agnostic with an Angular-specific integration layer (e.g. directives, injectables) where beneficial.

**Rationale:**
- Matches stated tech stack and team skills.
- Dashboard benefits from Angular’s structure (modules, routing, HTTP, RxJS).
- SDK core (collector, transport, event shape) can be reused by non-Angular apps if we later extract it to a small TS package; Angular part stays in this repo or a separate “angular-sdk” package.

**Trade-offs:** Non-Angular consumers must use the core API directly; we document both Angular and vanilla usage.

---

## 9. Mock Backend as First Consumer of Ingest API

**Decision:** Implement a Node.js mock backend that exposes the same ingest and visualization APIs as expected in production (e.g. POST /api/events, GET /api/insights).

**Rationale:**
- Validates API contract and SDK integration without real infra.
- Demo and E2E tests run against a known, deterministic backend.
- Production backend can be a different implementation (e.g. serverless, different DB) as long as it adheres to the same contract.

**Trade-offs:** Mock may diverge from production behavior; we keep the API spec (e.g. in docs or OpenAPI) as the source of truth.

---

## 10. Chart Library: ng2-charts (Chart.js) or Similar

**Decision:** Use a well-supported charting library that integrates with Angular (e.g. ng2-charts/Chart.js) for the dashboard’s performance trends, funnel, and distribution charts.

**Rationale:**
- Reduces custom canvas/SVG work and maintains accessibility and responsiveness.
- Chart.js is widely used and performant for time-series and categorical data.
- Aligns with “modular UI” and reuse of standard components.

**Trade-offs:** Custom or highly specific visualizations may require another library or custom component; we accept that for v1.

---

## 11. Testing Strategy: Unit → Integration → Performance

**Decision:** Prioritize unit tests for SDK and analytics logic; integration tests for ingest → engine → API; and a small set of performance tests (e.g. SDK overhead, batch size).

**Rationale:**
- Unit tests give fast feedback and high coverage on business logic.
- Integration tests catch contract and wiring issues before deployment.
- Performance tests guard against regression in SDK size and runtime cost; critical for observability tooling credibility.

**Trade-offs:** E2E UI tests for the dashboard are optional in v1 to save time; we add them as needed.

---

## 12. No PII by Default; Explicit Allow-List

**Decision:** SDK and backend do not collect or store PII by default; any field that might contain PII must be explicitly allow-listed and documented (e.g. for redaction or hashing).

**Rationale:**
- Reduces compliance and legal risk (e.g. GDPR, CCPA).
- Builds user and customer trust.
- Forces product to define “what we need” rather than “collect everything.”

**Trade-offs:** Some use cases (e.g. personalized support) may require explicit product and legal approval and configuration.

---

## Summary

Key themes: **modularity**, **observable streams**, **documentation and contracts**, **privacy by default**, and **pragmatic v1 choices** (rules over ML, thresholds and simple stats for anomalies) with a path to evolve. This log should be updated when significant new decisions are made or when prior decisions are revisited.
