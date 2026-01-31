import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventBusService } from './event-bus.service';

export interface SessionMetric {
  sessionId: string;
  route: string;
  eventCount: number;
  frictionCount: number;
  startTime: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly sessionMetrics$ = new BehaviorSubject<SessionMetric[]>([]);

  constructor(private eventBus: EventBusService) {
    this.eventBus.events$.subscribe((e) => this.recordEvent(e));
  }

  getSessionMetrics$() {
    return this.sessionMetrics$.asObservable();
  }

  private recordEvent(event: { type: string; payload: Record<string, unknown>; timestamp: number }): void {
    // Aggregate into session metrics; in a full impl would update sessionMetrics$
    const current = this.sessionMetrics$.value;
    if (current.length === 0) {
      this.sessionMetrics$.next([
        {
          sessionId: 'local-' + Date.now(),
          route: (event.payload['route'] as string) || '/',
          eventCount: 1,
          frictionCount: event.type === 'friction' ? 1 : 0,
          startTime: event.timestamp,
        },
      ]);
    }
  }
}
