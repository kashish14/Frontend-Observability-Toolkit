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

  /**
   * Capture LCP if available (browser support). LCP entries are only exposed through
   * PerformanceObserver (not getEntriesByType), so read the buffered entries once.
   */
  captureLCP(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      const observer = new PerformanceObserver((list) => {
        const last = list.getEntries().pop();
        if (last) this.trackTiming('LCP', last.startTime, 'largest-contentful-paint');
        observer.disconnect();
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // LCP not supported in this environment
    }
  }

  /** Capture FCP if available. */
  captureFCP(): void {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      try {
        // Call as a method: an unbound getEntriesByType throws "Illegal invocation" in browsers.
        const entries = performance.getEntriesByType('paint');
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
