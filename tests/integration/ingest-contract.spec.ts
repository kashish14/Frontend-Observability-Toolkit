/**
 * Contract test: POST /api/events accepts SDK-shaped payloads.
 * Run with mock-backend running: npm run start:backend (in another terminal).
 */
import { IngestEvent } from '../types';

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000';

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
    const body = await res.json();
    expect(body).toHaveProperty('accepted', 1);
  });

  it('GET /api/insights returns array', async () => {
    const res = await fetch(`${API_BASE}/api/insights`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/metrics returns array', async () => {
    const res = await fetch(`${API_BASE}/api/metrics`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/sessions returns array', async () => {
    const res = await fetch(`${API_BASE}/api/sessions`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /health returns ok', async () => {
    const res = await fetch(`${API_BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
  });
});
