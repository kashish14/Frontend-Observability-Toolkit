import { aggregateMetrics } from './aggregator';
import { IngestEvent } from './types';

describe('aggregateMetrics', () => {
  const baseTime = Date.now();
  const periodMs = 60 * 60 * 1000;

  it('aggregates performance events by metric name and period', () => {
    const events: IngestEvent[] = [
      { type: 'performance', timestamp: baseTime, payload: { name: 'LCP', value: 100 }, context: { sessionId: 's1', timestamp: baseTime } },
      { type: 'performance', timestamp: baseTime + 1000, payload: { name: 'LCP', value: 200 }, context: { sessionId: 's1', timestamp: baseTime } },
      { type: 'performance', timestamp: baseTime, payload: { name: 'FCP', value: 50 }, context: { sessionId: 's1', timestamp: baseTime } },
    ];
    const result = aggregateMetrics(events, periodMs, '1h');
    expect(result.length).toBeGreaterThanOrEqual(1);
    const lcp = result.find((r) => r.name === 'LCP');
    expect(lcp).toBeDefined();
    expect(lcp!.values.count).toBe(2);
    expect(lcp!.values.p50).toBe(200); // current impl: sorted[floor(2*0.5)] = sorted[1]
    expect(lcp!.values.p95).toBe(200);
  });

  it('aggregates render events as render_duration', () => {
    const events: IngestEvent[] = [
      { type: 'render', timestamp: baseTime, payload: { componentId: 'A', phase: 'render', durationMs: 20 }, context: { sessionId: 's1', timestamp: baseTime } },
    ];
    const result = aggregateMetrics(events, periodMs, '1h');
    const render = result.find((r) => r.name === 'render_duration');
    expect(render).toBeDefined();
    expect(render!.values.p50).toBe(20);
  });
});
