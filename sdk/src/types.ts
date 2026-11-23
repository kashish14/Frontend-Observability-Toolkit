/**
 * Canonical event envelope and context used across the SDK.
 */

export interface EventContext {
  sessionId: string;
  route?: string;
  view?: string;
  environment?: string;
  timestamp: number;
}

export interface BaseEvent<T = Record<string, unknown>> {
  type: string;
  timestamp: number;
  payload: T;
  context: EventContext;
}

export interface RenderEventPayload {
  componentId: string;
  phase: 'init' | 'render' | 'destroy' | 'custom';
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface UserEventPayload {
  eventType: string;
  target?: string;
  coordinates?: { x: number; y: number };
  metadata?: Record<string, unknown>;
}

export interface FrictionEventPayload {
  kind: 'rage_click' | 'dead_click' | 'scroll_thrash' | 'hesitation' | 'repeated_navigation' | 'long_loading' | 'abandoned_action';
  count?: number;
  windowMs?: number;
  target?: string;
  metadata?: Record<string, unknown>;
}

export interface AnomalyEventPayload {
  kind: string;
  value?: number;
  threshold?: number;
  baseline?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceTimingPayload {
  name: string;
  value: number;
  unit: 'ms';
  entryType?: string;
  metadata?: Record<string, unknown>;
}

export type MetricEvent =
  | BaseEvent<RenderEventPayload>
  | BaseEvent<UserEventPayload>
  | BaseEvent<FrictionEventPayload>
  | BaseEvent<AnomalyEventPayload>
  | BaseEvent<PerformanceTimingPayload>;

export interface SDKConfig {
  endpoint: string;
  sampleRate?: number;
  enabledModules?: {
    render?: boolean;
    events?: boolean;
    friction?: boolean;
    anomaly?: boolean;
    performance?: boolean;
  };
  batchSize?: number;
  flushIntervalMs?: number;
  piiAllowList?: string[];
  debug?: boolean;
}
