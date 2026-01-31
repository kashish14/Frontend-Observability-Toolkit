import { Observable } from 'rxjs';
import { SDKConfig, MetricEvent } from './types';
import { Transport } from './transport';
import { Collector } from './collector';
import { RenderTracker } from './render-tracker';
import { EventMonitor } from './event-monitor';
import { FrictionDetector } from './friction-detector';
import { AnomalyHooks } from './anomaly-hooks';
import { PerformanceTiming } from './performance-timing';
import { setRoute } from './context';

const DEFAULT_CONFIG: Required<SDKConfig> = {
  endpoint: '/api/events',
  sampleRate: 1,
  enabledModules: {
    render: true,
    events: true,
    friction: true,
    anomaly: true,
    performance: true,
  },
  batchSize: 10,
  flushIntervalMs: 5000,
  piiAllowList: [],
  debug: false,
};

let instance: ObservabilitySDK | null = null;

/**
 * Frontend Observability SDK — modular, observable, extensible.
 */
export class ObservabilitySDK {
  private readonly config: Required<SDKConfig>;
  private readonly transport: Transport;
  private readonly collector: Collector;
  readonly renderTracker: RenderTracker;
  readonly eventMonitor: EventMonitor;
  readonly frictionDetector: FrictionDetector;
  readonly anomalyHooks: AnomalyHooks;
  readonly performanceTiming: PerformanceTiming;

  private constructor(config: SDKConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.transport = new Transport({
      endpoint: this.config.endpoint,
      batchSize: this.config.batchSize,
      flushIntervalMs: this.config.flushIntervalMs,
      sampleRate: this.config.sampleRate,
      debug: this.config.debug,
    });
    this.collector = new Collector(this.transport);
    this.renderTracker = new RenderTracker(this.collector);
    this.eventMonitor = new EventMonitor(this.collector);
    this.frictionDetector = new FrictionDetector(this.collector);
    this.anomalyHooks = new AnomalyHooks(this.collector);
    this.performanceTiming = new PerformanceTiming(this.collector);
  }

  static init(config: SDKConfig): ObservabilitySDK {
    if (instance) return instance;
    instance = new ObservabilitySDK(config);
    return instance;
  }

  static getInstance(): ObservabilitySDK | null {
    return instance;
  }

  /** Track component render (convenience). */
  trackRender(componentId: string, phase: 'init' | 'render' | 'destroy' | 'custom', durationMs?: number, metadata?: Record<string, unknown>): void {
    if (this.config.enabledModules.render) {
      this.renderTracker.trackRender(componentId, phase, durationMs, metadata);
    }
  }

  /** Track custom event (convenience). */
  trackEvent(type: string, payload?: Record<string, unknown>): void {
    if (this.config.enabledModules.events) {
      this.eventMonitor.trackEvent(type, payload);
    }
  }

  /** Set current route for context. */
  setRoute(route: string): void {
    setRoute(route);
  }

  /** Stream of all metric events (for custom piping). */
  getMetrics$(): Observable<MetricEvent> {
    return this.collector.stream;
  }

  /** Stream of friction events. */
  getFriction$(): Observable<MetricEvent> {
    return this.frictionDetector.frictionStream;
  }

  /** Destroy SDK and flush queue. */
  destroy(): void {
    this.collector.destroy();
    instance = null;
  }
}

export { RenderTracker, EventMonitor, FrictionDetector, AnomalyHooks, PerformanceTiming };
export type { SDKConfig, MetricEvent, EventContext, BaseEvent, RenderEventPayload, UserEventPayload, FrictionEventPayload, AnomalyEventPayload, PerformanceTimingPayload } from './types';
export { createContext, setRoute, getLastRoute } from './context';
