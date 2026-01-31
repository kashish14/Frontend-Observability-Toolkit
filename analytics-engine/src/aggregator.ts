import { IngestEvent, AggregatedMetric } from './types';

/**
 * Aggregates raw events into time-window metrics (e.g. P50/P95 by hour).
 */
export function aggregateMetrics(events: IngestEvent[], periodMs: number, periodLabel: string): AggregatedMetric[] {
  const byMetricAndPeriod: Record<string, number[]> = {};

  for (const e of events) {
    if (e.type !== 'performance' && e.type !== 'render') continue;
    const periodStart = Math.floor(e.timestamp / periodMs) * periodMs;
    let metricName = e.type;
    let value: number | undefined;
    if (e.type === 'performance' && typeof (e.payload as any).value === 'number') {
      metricName = (e.payload as any).name ?? 'performance';
      value = (e.payload as any).value;
    }
    if (e.type === 'render' && typeof (e.payload as any).durationMs === 'number') {
      metricName = 'render_duration';
      value = (e.payload as any).durationMs;
    }
    if (value === undefined) continue;
    const key = `${metricName}:${periodStart}`;
    if (!byMetricAndPeriod[key]) byMetricAndPeriod[key] = [];
    byMetricAndPeriod[key].push(value);
  }

  const result: AggregatedMetric[] = [];
  for (const [key, values] of Object.entries(byMetricAndPeriod)) {
    const lastColon = key.lastIndexOf(':');
    const metricName = key.slice(0, lastColon);
    const periodStart = Number(key.slice(lastColon + 1));
    const sorted = [...values].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    result.push({
      name: metricName,
      period: periodLabel,
      periodStart,
      values: { p50, p95, count: values.length, sum: values.reduce((a, b) => a + b, 0) },
    });
  }
  return result;
}
