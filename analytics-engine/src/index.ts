import { IngestEvent, AggregatedMetric, AnomalyResult, Insight, SessionSummary } from './types';
import { aggregateMetrics } from './aggregator';
import { detectAnomalies } from './anomaly-detector';
import { generateInsights } from './insights-generator';
import { summarizeSessions } from './session-summarizer';

const DEFAULT_PERIOD_MS = 60 * 60 * 1000; // 1 hour

export interface EngineResult {
  aggregates: AggregatedMetric[];
  anomalies: AnomalyResult[];
  insights: Insight[];
  sessions: SessionSummary[];
}

/**
 * Process raw events into aggregates, anomalies, insights, and session summaries.
 */
export function processEvents(events: IngestEvent[], periodMs: number = DEFAULT_PERIOD_MS): EngineResult {
  const periodStart = events.length ? Math.min(...events.map((e) => e.timestamp)) : 0;
  const periodLabel = periodMs >= 86400000 ? '1d' : periodMs >= 3600000 ? '1h' : '15m';

  const aggregates = aggregateMetrics(events, periodMs, periodLabel);
  const anomalies = detectAnomalies(events, periodStart);
  const insights = generateInsights(events, aggregates, anomalies);
  const sessions = summarizeSessions(events);

  return { aggregates, anomalies, insights, sessions };
}

export { aggregateMetrics, detectAnomalies, generateInsights, summarizeSessions };
export type { IngestEvent, AggregatedMetric, AnomalyResult, Insight, SessionSummary } from './types';
