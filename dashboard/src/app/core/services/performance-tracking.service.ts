import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RenderTiming {
  componentId: string;
  phase: 'init' | 'render' | 'destroy';
  durationMs: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class PerformanceTrackingService {
  private readonly timings$ = new BehaviorSubject<RenderTiming[]>([]);
  private readonly marks = new Map<string, number>();

  getTimings$() {
    return this.timings$.asObservable();
  }

  markStart(componentId: string): void {
    this.marks.set(componentId, performance.now());
  }

  markEnd(componentId: string, phase: 'init' | 'render' | 'destroy'): void {
    const start = this.marks.get(componentId);
    if (start == null) return;
    const durationMs = performance.now() - start;
    this.marks.delete(componentId);
    const timing: RenderTiming = { componentId, phase, durationMs, timestamp: Date.now() };
    this.timings$.next([...this.timings$.value, timing].slice(-200));
  }

  recordTiming(componentId: string, phase: RenderTiming['phase'], durationMs: number): void {
    this.timings$.next([
      ...this.timings$.value,
      { componentId, phase, durationMs, timestamp: Date.now() },
    ].slice(-200));
  }
}
