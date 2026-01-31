import { IngestEvent } from '@frontend-observability/analytics-engine';

const now = Date.now();
const hour = 60 * 60 * 1000;

export function seedDummyEvents(): IngestEvent[] {
  const events: IngestEvent[] = [];
  const sessionIds = ['s1', 's2', 's3', 's4', 's5'];

  for (let i = 0; i < 50; i++) {
    const sessionId = sessionIds[i % sessionIds.length];
    const baseTime = now - (i % 5) * hour - i * 60000;
    events.push({
      type: 'performance',
      timestamp: baseTime,
      payload: { name: 'LCP', value: 1200 + Math.random() * 2000, unit: 'ms' },
      context: { sessionId, route: '/dashboard', timestamp: baseTime },
    });
    events.push({
      type: 'performance',
      timestamp: baseTime + 100,
      payload: { name: 'FCP', value: 800 + Math.random() * 600, unit: 'ms' },
      context: { sessionId, route: '/dashboard', timestamp: baseTime },
    });
  }

  for (let i = 0; i < 30; i++) {
    const sessionId = sessionIds[i % sessionIds.length];
    const baseTime = now - i * 120000;
    events.push({
      type: 'render',
      timestamp: baseTime,
      payload: { componentId: `AppComponent-${i % 5}`, phase: 'render', durationMs: 10 + Math.random() * 40 },
      context: { sessionId, route: '/dashboard', timestamp: baseTime },
    });
  }

  for (let i = 0; i < 20; i++) {
    const sessionId = sessionIds[i % sessionIds.length];
    const baseTime = now - i * 180000;
    events.push({
      type: 'user_event',
      timestamp: baseTime,
      payload: { eventType: 'click', target: 'button.primary' },
      context: { sessionId, route: '/checkout', timestamp: baseTime },
    });
  }

  for (let i = 0; i < 8; i++) {
    const sessionId = sessionIds[i % sessionIds.length];
    const baseTime = now - i * 300000;
    events.push({
      type: 'friction',
      timestamp: baseTime,
      payload: { kind: i % 2 === 0 ? 'rage_click' : 'dead_click', count: 3, target: 'div.card' },
      context: { sessionId, route: '/list', timestamp: baseTime },
    });
  }

  for (let i = 0; i < 3; i++) {
    const sessionId = sessionIds[i];
    const baseTime = now - i * 600000;
    events.push({
      type: 'anomaly',
      timestamp: baseTime,
      payload: { kind: 'error', metadata: { message: 'Network timeout' } },
      context: { sessionId, route: '/api', timestamp: baseTime },
    });
  }

  return events;
}
