import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AppEventType =
  | 'render'
  | 'click'
  | 'navigation'
  | 'friction'
  | 'anomaly'
  | 'performance'
  | 'error';

export interface AppEvent {
  type: AppEventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly bus$ = new Subject<AppEvent>();

  get events$() {
    return this.bus$.asObservable();
  }

  emit(type: AppEventType, payload: Record<string, unknown> = {}): void {
    this.bus$.next({ type, payload, timestamp: Date.now() });
  }
}
