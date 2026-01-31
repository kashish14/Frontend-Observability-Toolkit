import express from 'express';
import cors from 'cors';
import { processEvents } from '@frontend-observability/analytics-engine';
import type { IngestEvent } from '@frontend-observability/analytics-engine';
import { seedDummyEvents } from './seed';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const store: IngestEvent[] = seedDummyEvents();
const PORT = process.env.PORT ?? 3000;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

app.post('/api/events', (req, res) => {
  const body = req.body as { events?: IngestEvent[] };
  const events = Array.isArray(body?.events) ? body.events : [];
  for (const e of events) {
    if (e && typeof e.timestamp === 'number' && e.type && e.payload) {
      store.push({
        ...e,
        context: e.context ?? { sessionId: 'unknown', timestamp: e.timestamp },
      });
    }
  }
  res.status(202).json({ accepted: events.length });
});

function getProcessed() {
  const periodMs = 60 * 60 * 1000;
  return processEvents(store, periodMs);
}

app.get('/api/insights', (_req, res) => {
  const { insights } = getProcessed();
  res.json(insights);
});

app.get('/api/metrics', (_req, res) => {
  const { aggregates } = getProcessed();
  res.json(aggregates);
});

app.get('/api/anomalies', (_req, res) => {
  const { anomalies } = getProcessed();
  res.json(anomalies);
});

app.get('/api/sessions', (_req, res) => {
  const { sessions } = getProcessed();
  res.json(sessions);
});

app.get('/api/events/summary', (_req, res) => {
  const total = store.length;
  const byType = store.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  res.json({ total, byType });
});

app.listen(PORT, () => {
  console.log(`Mock backend running at http://localhost:${PORT}`);
  console.log(`  Health: GET /health`);
  console.log(`  Ingest: POST /api/events`);
  console.log(`  Dashboard: GET /api/insights, /api/metrics, /api/anomalies, /api/sessions`);
});
