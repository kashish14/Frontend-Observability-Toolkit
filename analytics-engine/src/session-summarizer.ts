import { IngestEvent, SessionSummary } from './types';

/**
 * Builds session-level summaries from events.
 */
export function summarizeSessions(events: IngestEvent[]): SessionSummary[] {
  const bySession = new Map<string, IngestEvent[]>();
  for (const e of events) {
    const sid = e.context?.sessionId ?? 'unknown';
    if (!bySession.has(sid)) bySession.set(sid, []);
    bySession.get(sid)!.push(e);
  }

  const summaries: SessionSummary[] = [];
  for (const [sessionId, sessionEvents] of bySession) {
    const timestamps = sessionEvents.map((x) => x.timestamp);
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);
    const frictionCount = sessionEvents.filter((e) => e.type === 'friction').length;
    const errorCount = sessionEvents.filter((e) => e.type === 'anomaly').length;
    const perf = sessionEvents
      .filter((e) => e.type === 'performance')
      .reduce((acc, e) => {
        const p = e.payload as any;
        if (p?.name === 'LCP') acc.lcp = p.value;
        if (p?.name === 'FCP') acc.fcp = p.value;
        return acc;
      }, {} as { lcp?: number; fcp?: number });
    const route = sessionEvents.find((e) => e.context?.route)?.context?.route;
    summaries.push({
      sessionId,
      route,
      eventCount: sessionEvents.length,
      frictionCount,
      errorCount,
      startTime,
      endTime,
      performance: Object.keys(perf).length ? perf : undefined,
    });
  }
  return summaries;
}
