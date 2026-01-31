/**
 * Event and aggregate types for the analytics engine (aligned with SDK).
 */

export interface EventContext {
  sessionId: string;
  route?: string;
  view?: string;
  environment?: string;
  timestamp: number;
}

export interface IngestEvent {
  type: string;
  timestamp: number;
  payload: Record<string, unknown>;
  context: EventContext;
}

export interface AggregatedMetric {
  name: string;
  period: string; // e.g. '1h', '1d'
  periodStart: number;
  values: { p50: number; p95: number; count: number; sum?: number };
  dimensions?: Record<string, string>; // route, componentId, etc.
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
