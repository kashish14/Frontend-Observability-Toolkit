import { MetricEvent } from './types';

export interface TransportConfig {
  endpoint: string;
  batchSize: number;
  flushIntervalMs: number;
  sampleRate: number;
  debug?: boolean;
}

/**
 * Batches events and sends to ingest endpoint. Non-blocking.
 */
export class Transport {
  private queue: MetricEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private readonly config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
    this.scheduleFlush();
  }

  send(event: MetricEvent): void {
    if (Math.random() > this.config.sampleRate) return;
    this.queue.push(event);
    if (this.queue.length >= this.config.batchSize) this.flush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), this.config.flushIntervalMs);
    // In Node (SSR, tests) the flush timer must not keep the process alive.
    (this.flushTimer as { unref?: () => void }).unref?.();
  }

  flush(): void {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.config.batchSize);
    this.doSend(batch).catch((err) => {
      if (this.config.debug) console.warn('[FO SDK] Send failed', err);
      this.queue.unshift(...batch);
    });
  }

  private async doSend(events: MetricEvent[]): Promise<void> {
    const res = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true, // lets the final flush survive page unload
    });
    if (!res.ok) throw new Error(`Ingest failed: ${res.status}`);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}
