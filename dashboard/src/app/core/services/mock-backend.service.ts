import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type { AggregatedMetric, AnomalyResult, Insight, SessionSummary } from './observability-api.service';

/** Generates mock analytics data for local run without Node backend. */
@Injectable({ providedIn: 'root' })
export class MockBackendService {
  private readonly periodMs = 60 * 60 * 1000;
  private baseTime = Date.now();

  getMetrics(): Observable<AggregatedMetric[]> {
    const data: AggregatedMetric[] = [
      { name: 'LCP', period: '1h', periodStart: this.baseTime - this.periodMs, values: { p50: 1200, p95: 2100, count: 50, sum: 60000 } },
      { name: 'FCP', period: '1h', periodStart: this.baseTime - this.periodMs, values: { p50: 800, p95: 1200, count: 50, sum: 40000 } },
      { name: 'render_duration', period: '1h', periodStart: this.baseTime - this.periodMs, values: { p50: 15, p95: 45, count: 30, sum: 450 } },
    ];
    return of(data).pipe(delay(300));
  }

  getAnomalies(): Observable<AnomalyResult[]> {
    const data: AnomalyResult[] = [
      { id: 'lcp-1', kind: 'threshold', metric: 'LCP', value: 2800, threshold: 2500, periodStart: this.baseTime, severity: 'medium' },
      { id: 'err-1', kind: 'error_rate', value: 0.06, threshold: 0.05, periodStart: this.baseTime, severity: 'medium' },
    ];
    return of(data).pipe(delay(200));
  }

  getInsights(): Observable<Insight[]> {
    const data: Insight[] = [
      { id: 'i1', type: 'performance', title: 'LCP degradation', description: 'P95 LCP is 2100ms. Consider optimizing largest contentful paint.', periodStart: this.baseTime, severity: 'warning', metric: 'LCP', value: 2100 },
      { id: 'i2', type: 'friction', title: 'Elevated friction', description: '8 friction events in period. Review rage/dead clicks.', periodStart: this.baseTime, severity: 'info', metadata: { frictionCount: 8 } },
    ];
    return of(data).pipe(delay(200));
  }

  getSessions(): Observable<SessionSummary[]> {
    const data: SessionSummary[] = [
      { sessionId: 's1', route: '/dashboard', eventCount: 42, frictionCount: 2, errorCount: 0, startTime: this.baseTime - 3600000, endTime: this.baseTime, performance: { lcp: 1100, fcp: 700 } },
      { sessionId: 's2', route: '/checkout', eventCount: 28, frictionCount: 5, errorCount: 1, startTime: this.baseTime - 1800000, endTime: this.baseTime - 600000, performance: { lcp: 1500, fcp: 900 } },
      { sessionId: 's3', route: '/list', eventCount: 15, frictionCount: 1, errorCount: 0, startTime: this.baseTime - 900000, endTime: this.baseTime - 300000 },
    ];
    return of(data).pipe(delay(250));
  }

  getEventsSummary(): Observable<{ total: number; byType: Record<string, number> }> {
    return of({
      total: 111,
      byType: { performance: 50, render: 30, user_event: 20, friction: 8, anomaly: 3 },
    }).pipe(delay(150));
  }
}
