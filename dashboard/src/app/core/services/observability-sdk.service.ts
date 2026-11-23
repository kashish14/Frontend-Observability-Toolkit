import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ObservabilitySDK } from '@frontend-observability/sdk';
import { environment } from '../../../environments/environment';
import { EventBusService } from './event-bus.service';
import { PerformanceTrackingService } from './performance-tracking.service';
import { FrictionDetectionService } from './friction-detection.service';
import { LoggingService } from './logging.service';

/**
 * Integrates render tracking, navigation, clicks and friction detection.
 * In live mode the events are also sent to the ingest API through the SDK package.
 */
@Injectable({ providedIn: 'root' })
export class ObservabilitySdkService implements OnDestroy {
  private navSub: ReturnType<typeof this.router.events.subscribe> | null = null;
  private frictionSub: ReturnType<typeof this.friction.friction$.subscribe> | null = null;
  private readonly sdk: ObservabilitySDK | null = environment.enableMockBackend
    ? null
    : ObservabilitySDK.init({ endpoint: `${environment.apiBase}/events`, batchSize: 5, flushIntervalMs: 2000 });

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
        this.sdk?.setRoute(url);
        this.sdk?.eventMonitor.trackRouteChange(url);
      }
    });
    this.frictionSub = this.friction.friction$.subscribe((insight) => {
      this.eventBus.emit('friction', { kind: insight.kind, count: insight.count });
      this.sdk?.frictionDetector.emitFriction(insight.kind, { count: insight.count, target: insight.target });
    });
    if (this.sdk) {
      // Send whatever is queued when the tab is closed or reloaded.
      addEventListener('pagehide', () => this.sdk?.destroy());
      // Paint timings are available shortly after the first render.
      setTimeout(() => {
        this.sdk?.performanceTiming.captureFCP();
        this.sdk?.performanceTiming.captureLCP();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    this.frictionSub?.unsubscribe();
    this.sdk?.destroy();
  }

  trackRenderStart(componentId: string): void {
    this.performance.markStart(componentId);
  }

  trackRenderEnd(componentId: string, phase: 'init' | 'render' | 'destroy'): void {
    this.performance.markEnd(componentId, phase);
    this.eventBus.emit('render', { componentId, phase });
    this.sdk?.trackRender(componentId, phase);
  }

  trackClick(target?: string): void {
    this.eventBus.emit('click', { target });
    this.friction.recordClick(target);
    this.sdk?.eventMonitor.trackClick(target ?? 'unknown');
  }

  startLoading(): void {
    this.friction.startLoading();
  }

  endLoading(): void {
    this.friction.endLoading();
  }
}
