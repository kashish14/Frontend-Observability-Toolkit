import { AnomalyEventPayload } from './types';
import { Collector } from './collector';

/**
 * Hooks for emitting anomaly events: error rate, long task, custom thresholds.
 */
export class AnomalyHooks {
  constructor(private readonly collector: Collector) {}

  emitAnomaly(kind: string, payload?: Partial<AnomalyEventPayload>): void {
    this.collector.emit({
      type: 'anomaly',
      timestamp: Date.now(),
      payload: { kind, ...payload },
    } as any);
  }

  reportError(message: string, metadata?: Record<string, unknown>): void {
    this.emitAnomaly('error', { metadata: { message, ...metadata } });
  }

  reportLongTask(durationMs: number, thresholdMs: number): void {
    this.emitAnomaly('long_task', { value: durationMs, threshold: thresholdMs });
  }

  reportThresholdExceeded(name: string, value: number, threshold: number, baseline?: number): void {
    this.emitAnomaly('threshold', { value, threshold, baseline, metadata: { metric: name } });
  }
}
