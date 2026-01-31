import { Subject } from 'rxjs';
import { FrictionEventPayload } from './types';
import { Collector } from './collector';
import { MetricEvent } from './types';

const RAGE_CLICK_COUNT = 3;
const RAGE_CLICK_WINDOW_MS = 500;
const DEAD_CLICK_TARGETS = ['div', 'span', 'p', 'section', 'main', 'article'];

/**
 * Consumes event stream and detects UX friction: rage click, dead click, etc.
 * Call recordClick / recordRageClick from event handlers or from event-monitor.
 */
export class FrictionDetector {
  private readonly friction$ = new Subject<MetricEvent>();
  private readonly recentClicks: { ts: number; target?: string }[] = [];
  private readonly maxClicks = 10;

  constructor(private readonly collector: Collector) {}

  get frictionStream() {
    return this.friction$.asObservable();
  }

  /** Call when a click is detected; may emit friction event. */
  recordClick(target: string, coordinates?: { x: number; y: number }): void {
    const tag = (target || '').toLowerCase();
    const isDead = DEAD_CLICK_TARGETS.some((t) => tag.includes(t) || tag === t);
    if (isDead) {
      this.emitFriction('dead_click', { target, metadata: coordinates ? { coordinates } : undefined });
    }
  }

  /** Call with recent click timestamps to detect rage click. */
  recordRageClick(count: number, windowMs: number, target?: string): void {
    if (count >= RAGE_CLICK_COUNT && windowMs <= RAGE_CLICK_WINDOW_MS) {
      this.emitFriction('rage_click', { count, windowMs, target });
    }
  }

  emitFriction(kind: FrictionEventPayload['kind'], payload: Partial<FrictionEventPayload>): void {
    const event: MetricEvent = {
      type: 'friction',
      timestamp: Date.now(),
      payload: { kind, ...payload },
    } as MetricEvent;
    this.collector.emit(event);
    this.friction$.next(event);
  }
}
