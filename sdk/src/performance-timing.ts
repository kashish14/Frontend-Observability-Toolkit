import { PerformanceTimingPayload } from './types';
import { Collector } from './collector';

/**
 * Captures performance timing: LCP, FCP, TTI, custom marks.
 */
export class PerformanceTiming {
  constructor(private readonly collector: Collector) {}

  trackTiming(name: string, valueMs: number, entryType?: string, metadata?: Record<string, unknown>): void {
    this.collector.emit({
      type: 'performance',
      timestamp: Date.now(),
      payload: { name, value: valueMs, unit: 'ms', entryType, metadata },
    } as any);
  }

  /** Capture LCP if available (browser support). */
  captureLCP(): void {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const getEntries = performance.getEntriesByType as (type: string) => PerformanceEntry[];
      try {
        const entries = getEntries('largest-contentful-paint');
        const last = entries[entries.length - 1];
        if (last && 'renderTime' in last) {
          this.trackTiming('LCP', (last as any).renderTime, 'largest-contentful-paint');
        }
      } catch {
        // LCP not supported in this environment
      }
    }
  }

  /** Capture FCP if available. */
  captureFCP(): void {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const getEntries = performance.getEntriesByType as (type: string) => PerformanceEntry[];
      try {
        const entries = getEntries('paint');
        const fcp = entries.find((e) => e.name === 'first-contentful-paint');
        if (fcp) this.trackTiming('FCP', fcp.startTime, 'paint');
      } catch {
        // paint entries not supported
      }
    }
  }

  /** Custom mark: call with name and duration in ms. */
  mark(name: string, durationMs: number, metadata?: Record<string, unknown>): void {
    this.trackTiming(name, durationMs, 'measure', metadata);
  }
}
