import { RenderEventPayload } from './types';
import { Collector } from './collector';

/**
 * Tracks component render lifecycle: init, render, destroy, custom marks.
 */
export class RenderTracker {
  private readonly marks = new Map<string, number>();

  constructor(private readonly collector: Collector) {}

  trackRender(componentId: string, phase: RenderEventPayload['phase'], durationMs?: number, metadata?: Record<string, unknown>): void {
    this.collector.emit({
      type: 'render',
      timestamp: Date.now(),
      payload: { componentId, phase, durationMs, metadata },
    });
  }

  markStart(componentId: string): void {
    this.marks.set(componentId, performance.now());
  }

  markEnd(componentId: string, phase: 'render' | 'custom' = 'render'): void {
    const start = this.marks.get(componentId);
    if (start === undefined) return;
    const durationMs = performance.now() - start;
    this.marks.delete(componentId);
    this.trackRender(componentId, phase, durationMs);
  }
}
