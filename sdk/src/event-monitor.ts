import { UserEventPayload } from './types';
import { Collector } from './collector';

/**
 * Monitors user and app events (clicks, route changes, custom) and emits normalized events.
 */
export class EventMonitor {
  constructor(private readonly collector: Collector) {}

  trackEvent(eventType: string, payload?: Partial<UserEventPayload>): void {
    this.collector.emit({
      type: 'user_event',
      timestamp: Date.now(),
      payload: { eventType, ...payload },
    });
  }

  trackClick(target: string, coordinates?: { x: number; y: number }, metadata?: Record<string, unknown>): void {
    this.trackEvent('click', { target, coordinates, metadata });
  }

  trackRouteChange(route: string, metadata?: Record<string, unknown>): void {
    this.trackEvent('route_change', { metadata: { ...metadata, route } });
  }
}
