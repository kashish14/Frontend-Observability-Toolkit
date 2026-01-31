import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EventBusService } from './event-bus.service';
import { LoggingService } from './logging.service';

export interface FrictionInsight {
  kind: 'rage_click' | 'repeated_navigation' | 'long_loading' | 'abandoned_action';
  count?: number;
  windowMs?: number;
  target?: string;
  timestamp: number;
}

const RAGE_CLICK_COUNT = 3;
const RAGE_CLICK_WINDOW_MS = 500;
const REPEATED_NAV_THRESHOLD = 3;
const LONG_LOADING_MS = 3000;

@Injectable({ providedIn: 'root' })
export class FrictionDetectionService {
  private readonly recentClicks: number[] = [];
  private readonly recentNavs: { route: string; ts: number }[] = [];
  private loadStartTs = 0;

  readonly friction$ = new Subject<FrictionInsight>();

  constructor(
    private eventBus: EventBusService,
    private logging: LoggingService,
  ) {}

  recordClick(target?: string): void {
    const now = Date.now();
    this.recentClicks.push(now);
    const windowStart = now - RAGE_CLICK_WINDOW_MS;
    const inWindow = this.recentClicks.filter((ts) => ts >= windowStart);
    if (inWindow.length >= RAGE_CLICK_COUNT) {
      this.recentClicks.length = 0;
      const insight: FrictionInsight = { kind: 'rage_click', count: inWindow.length, windowMs: RAGE_CLICK_WINDOW_MS, target, timestamp: now };
      this.friction$.next(insight);
      this.eventBus.emit('friction', { kind: 'rage_click', count: inWindow.length });
      this.logging.warn(`Rage click detected: ${inWindow.length} clicks in ${RAGE_CLICK_WINDOW_MS}ms`, target);
    }
    if (this.recentClicks.length > 20) this.recentClicks.shift();
  }

  recordNavigation(route: string): void {
    const now = Date.now();
    this.recentNavs.push({ route, ts: now });
    const recent = this.recentNavs.filter((n) => n.ts >= now - 10000);
    const sameRoute = recent.filter((n) => n.route === route).length;
    if (sameRoute >= REPEATED_NAV_THRESHOLD) {
      const insight: FrictionInsight = { kind: 'repeated_navigation', count: sameRoute, target: route, timestamp: now };
      this.friction$.next(insight);
      this.logging.warn(`Repeated navigation: ${route} ${sameRoute} times in 10s`);
    }
    this.recentNavs.length = 0;
    this.recentNavs.push(...recent.slice(-10));
  }

  startLoading(): void {
    this.loadStartTs = performance.now();
  }

  endLoading(): void {
    if (this.loadStartTs <= 0) return;
    const duration = performance.now() - this.loadStartTs;
    if (duration >= LONG_LOADING_MS) {
      this.friction$.next({ kind: 'long_loading', windowMs: Math.round(duration), timestamp: Date.now() });
      this.logging.warn(`Long loading: ${Math.round(duration)}ms`);
    }
    this.loadStartTs = 0;
  }

  recordAbandonedAction(action: string): void {
    this.friction$.next({ kind: 'abandoned_action', target: action, timestamp: Date.now() });
    this.logging.info(`Abandoned action: ${action}`);
  }
}
