/**
 * Minimal types for contract tests (aligned with analytics-engine IngestEvent).
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
