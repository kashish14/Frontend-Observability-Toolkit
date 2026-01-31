import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = '/api';

export interface AggregatedMetric {
  name: string;
  period: string;
  periodStart: number;
  values: { p50: number; p95: number; count: number; sum?: number };
  dimensions?: Record<string, string>;
}

export interface AnomalyResult {
  id: string;
  kind: string;
  metric?: string;
  value?: number;
  threshold?: number;
  baseline?: number;
  periodStart: number;
  severity: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
}

export interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  periodStart: number;
  severity: 'info' | 'warning' | 'critical';
  metric?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface SessionSummary {
  sessionId: string;
  route?: string;
  eventCount: number;
  frictionCount: number;
  errorCount: number;
  startTime: number;
  endTime: number;
  performance?: { lcp?: number; fcp?: number };
}

@Injectable({ providedIn: 'root' })
export class ObservabilityApiService {
  constructor(private http: HttpClient) {}

  getMetrics(): Observable<AggregatedMetric[]> {
    return this.http.get<AggregatedMetric[]>(`${API_BASE}/metrics`) as unknown as Observable<AggregatedMetric[]>;
  }

  getAnomalies(): Observable<AnomalyResult[]> {
    return this.http.get<AnomalyResult[]>(`${API_BASE}/anomalies`) as unknown as Observable<AnomalyResult[]>;
  }

  getInsights(): Observable<Insight[]> {
    return this.http.get<Insight[]>(`${API_BASE}/insights`) as unknown as Observable<Insight[]>;
  }

  getSessions(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(`${API_BASE}/sessions`) as unknown as Observable<SessionSummary[]>;
  }

  getEventsSummary(): Observable<{ total: number; byType: Record<string, number> }> {
    return this.http.get<{ total: number; byType: Record<string, number> }>(`${API_BASE}/events/summary`) as unknown as Observable<{ total: number; byType: Record<string, number> }>;
  }
}
