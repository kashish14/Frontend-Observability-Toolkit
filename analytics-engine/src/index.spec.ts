import { processEvents } from './index';
import type { IngestEvent } from './types';

describe('processEvents', () => {
  it('returns aggregates, anomalies, insights, sessions', () => {
    const events: IngestEvent[] = [
      {
        type: 'performance',
        timestamp: Date.now(),
        payload: { name: 'LCP', value: 1500 },
        context: { sessionId: 's1', timestamp: Date.now() },
      },
      {
        type: 'render',
        timestamp: Date.now(),
        payload: { componentId: 'A', phase: 'render', durationMs: 15 },
        context: { sessionId: 's1', timestamp: Date.now() },
      },
    ];
    const result = processEvents(events);
    expect('aggregates' in result).toBe(true);
    expect('anomalies' in result).toBe(true);
    expect('insights' in result).toBe(true);
    expect('sessions' in result).toBe(true);
    expect(Array.isArray(result.aggregates)).toBe(true);
    expect(Array.isArray(result.sessions)).toBe(true);
    expect(result.sessions.length).toBe(1);
    expect(result.sessions[0].sessionId).toBe('s1');
  });
});
