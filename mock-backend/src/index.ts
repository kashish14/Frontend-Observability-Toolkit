import { createApp } from './app';

const PORT = process.env.PORT ?? 3000;

createApp().listen(PORT, () => {
  console.log(`Mock backend running at http://localhost:${PORT}`);
  console.log(`  Health: GET /health`);
  console.log(`  Ingest: POST /api/events`);
  console.log(`  Dashboard: GET /api/insights, /api/metrics, /api/anomalies, /api/sessions`);
});
