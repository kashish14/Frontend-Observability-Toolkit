import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { EventBusService } from './event-bus.service';
import { PerformanceTrackingService } from './performance-tracking.service';
import { FrictionDetectionService } from './friction-detection.service';
import { LoggingService } from './logging.service';

/** Integrates component render tracking, event monitoring, navigation delays, and friction detection. */
@Injectable({ providedIn: 'root' })
export class ObservabilitySdkService implements OnDestroy {
  private navSub: ReturnType<typeof this.router.events.subscribe> | null = null;
  private frictionSub: ReturnType<typeof this.friction.friction$.subscribe> | null = null;

  constructor(
    private router: Router,
    private eventBus: EventBusService,
    private performance: PerformanceTrackingService,
    private friction: FrictionDetectionService,
    private logging: LoggingService,
  ) {
    this.navSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const url = e.urlAfterRedirects ?? '/';
        this.friction.recordNavigation(url);
        this.eventBus.emit('navigation', { route: url });
        this.logging.info('Navigation', url);
      }
    });
    this.frictionSub = this.friction.friction$.subscribe((insight) => {
      this.eventBus.emit('friction', { kind: insight.kind, count: insight.count });
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    this.frictionSub?.unsubscribe();
  }

  trackRenderStart(componentId: string): void {
    this.performance.markStart(componentId);
  }

  trackRenderEnd(componentId: string, phase: 'init' | 'render' | 'destroy'): void {
    this.performance.markEnd(componentId, phase);
    this.eventBus.emit('render', { componentId, phase });
  }

  trackClick(target?: string): void {
    this.eventBus.emit('click', { target });
    this.friction.recordClick(target);
  }

  startLoading(): void {
    this.friction.startLoading();
  }

  endLoading(): void {
    this.friction.endLoading();
  }
}
