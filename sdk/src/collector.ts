import { Subject } from 'rxjs';
import { MetricEvent } from './types';
import { createContext } from './context';
import { Transport } from './transport';

/**
 * Central collector: receives events, attaches context, forwards to transport and observable stream.
 */
export class Collector {
  private readonly stream$ = new Subject<MetricEvent>();
  private readonly transport: Transport;

  constructor(transport: Transport) {
    this.transport = transport;
  }

  get stream() {
    return this.stream$.asObservable();
  }

  emit(raw: Omit<MetricEvent, 'context'> & { context?: Partial<MetricEvent['context']> }): void {
    const event: MetricEvent = {
      ...raw,
      context: { ...createContext(), ...(raw.context || {}) },
    } as MetricEvent;
    this.transport.send(event);
    this.stream$.next(event);
  }

  destroy(): void {
    this.stream$.complete();
    this.transport.destroy();
  }
}
