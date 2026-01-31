import { IngestEvent, AggregatedMetric, AnomalyResult, Insight } from './types';

/**
 * Generates human-readable insights from aggregates and anomalies.
 */
export function generateInsights(
  events: IngestEvent[],
  aggregates: AggregatedMetric[],
  anomalies: AnomalyResult[]
): Insight[] {
  const insights: Insight[] = [];

  for (const a of anomalies) {
    insights.push({
      id: a.id,
      type: 'anomaly',
      title: a.metric ? `${a.metric} anomaly` : a.kind,
      description: a.value != null && a.threshold != null
        ? `Value ${a.value} exceeded threshold ${a.threshold}`
        : `Anomaly detected: ${a.kind}`,
      periodStart: a.periodStart,
      severity: a.severity === 'high' ? 'critical' : a.severity === 'medium' ? 'warning' : 'info',
      metric: a.metric,
      value: a.value,
      metadata: a.metadata,
    });
  }

  const lcpAgg = aggregates.find((x) => x.name === 'LCP');
  if (lcpAgg && lcpAgg.values.p95 > 2000) {
    insights.push({
      id: `insight-lcp-${lcpAgg.periodStart}`,
      type: 'performance',
      title: 'LCP degradation',
      description: `P95 LCP is ${Math.round(lcpAgg.values.p95)}ms. Consider optimizing largest contentful paint.`,
      periodStart: lcpAgg.periodStart,
      severity: 'warning',
      metric: 'LCP',
      value: lcpAgg.values.p95,
    });
  }

  const frictionCount = events.filter((e) => e.type === 'friction').length;
  if (frictionCount > 10) {
    const periodStart = events.length ? Math.min(...events.map((e) => e.timestamp)) : 0;
    insights.push({
      id: `insight-friction-${periodStart}`,
      type: 'friction',
      title: 'Elevated friction',
      description: `${frictionCount} friction events in period. Review rage/dead clicks and hesitation.`,
      periodStart,
      severity: 'info',
      metadata: { frictionCount },
    });
  }

  return insights;
}
