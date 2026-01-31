import { IngestEvent, AnomalyResult } from './types';

const LCP_THRESHOLD_MS = 2500;
const ERROR_RATE_THRESHOLD = 0.05;

/**
 * Detects anomalies: threshold-based (e.g. LCP > 2.5s) and simple error-rate.
 */
export function detectAnomalies(events: IngestEvent[], periodStart: number): AnomalyResult[] {
  const results: AnomalyResult[] = [];
  const lcpValues = events
    .filter((e) => e.type === 'performance' && (e.payload as any).name === 'LCP')
    .map((e) => (e.payload as any).value as number);
  const errorCount = events.filter((e) => e.type === 'anomaly' || (e.payload as any).message).length;
  const total = events.length;
  const errorRate = total > 0 ? errorCount / total : 0;

  if (lcpValues.length) {
    const maxLcp = Math.max(...lcpValues);
    if (maxLcp > LCP_THRESHOLD_MS) {
      results.push({
        id: `lcp-${periodStart}`,
        kind: 'threshold',
        metric: 'LCP',
        value: maxLcp,
        threshold: LCP_THRESHOLD_MS,
        periodStart,
        severity: maxLcp > 4000 ? 'high' : 'medium',
      });
    }
  }

  if (errorRate > ERROR_RATE_THRESHOLD) {
    results.push({
      id: `error-rate-${periodStart}`,
      kind: 'error_rate',
      value: errorRate,
      threshold: ERROR_RATE_THRESHOLD,
      periodStart,
      severity: errorRate > 0.1 ? 'high' : 'medium',
    });
  }

  return results;
}
