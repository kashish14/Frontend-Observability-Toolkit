/**
 * Contract + end-to-end tests against the real mock backend (started in-process on a random port).
 * Flow under test: SDK -> POST /api/events -> analytics engine -> GET /api/* (what the dashboard reads).
 */
import type { AddressInfo } from 'net';
import type { Server } from 'http';
import { ObservabilitySDK } from '@frontend-observability/sdk';
import { createApp } from '../../mock-backend/src/app';
import { IngestEvent } from '../types';

let server: Server;
let API_BASE: string;

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  API_BASE = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

const getJson = async (path: string) => {
  const res = await fetch(`${API_BASE}${path}`);
  expect(res.status).toBe(200);
  return res.json();
};

describe('Ingest API contract', () => {
  const validEvent: IngestEvent = {
    type: 'performance',
    timestamp: Date.now(),
    payload: { name: 'LCP', value: 1500, unit: 'ms' },
    context: { sessionId: 'test-session', timestamp: Date.now() },
  };

  it('POST /api/events accepts { events: IngestEvent[] }', async () => {
    const res = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [validEvent] }),
    });
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: 1 });
  });

  it.each(['/api/insights', '/api/metrics', '/api/anomalies', '/api/sessions'])('GET %s returns an array', async (path) => {
    expect(Array.isArray(await getJson(path))).toBe(true);
  });

  it('GET /health returns ok', async () => {
    expect(await getJson('/health')).toMatchObject({ status: 'ok' });
  });
});

describe('End to end: SDK -> backend -> analytics', () => {
  it('events tracked by the SDK show up in the summary, sessions and metrics', async () => {
    const before = await getJson('/api/events/summary');

    const sdk = ObservabilitySDK.init({ endpoint: `${API_BASE}/api/events`, batchSize: 50, flushIntervalMs: 60_000 });
    sdk.setRoute('/checkout');
    sdk.trackEvent('checkout_started', { metadata: { step: 1 } });
    sdk.trackRender('CheckoutComponent', 'render', 42);
    sdk.performanceTiming.mark('LCP', 1800);
    sdk.destroy(); // flushes the queue

    // Transport sends asynchronously; poll until the backend has the batch.
    let after = before;
    for (let i = 0; i < 50 && after.total < before.total + 3; i++) {
      await new Promise((r) => setTimeout(r, 20));
      after = await getJson('/api/events/summary');
    }
    expect(after.total).toBe(before.total + 3);
    expect(after.byType.user_event).toBe((before.byType.user_event ?? 0) + 1);
    expect(after.byType.render).toBe((before.byType.render ?? 0) + 1);

    const sessions: { route?: string }[] = await getJson('/api/sessions');
    expect(sessions.some((s) => s.route === '/checkout')).toBe(true);

    const metrics: { name: string }[] = await getJson('/api/metrics');
    expect(metrics.some((m) => m.name === 'LCP')).toBe(true);
  });
});
