/**
 * SDK overhead sanity check: tracking events (context + queue + stream) must stay cheap.
 * Browser-level LCP/CPU benchmarks are out of scope for this suite.
 */
import { ObservabilitySDK } from '@frontend-observability/sdk';

describe('SDK overhead', () => {
  const realFetch = global.fetch;
  beforeAll(() => {
    global.fetch = (() => Promise.resolve(new Response(null, { status: 202 }))) as typeof fetch;
  });
  afterAll(() => {
    global.fetch = realFetch;
  });

  it('tracks 1,000 events in under 100ms', () => {
    const sdk = ObservabilitySDK.init({ endpoint: 'http://localhost/api/events', batchSize: 100, flushIntervalMs: 60_000 });
    let streamed = 0;
    sdk.getMetrics$().subscribe(() => streamed++);

    const start = performance.now();
    for (let i = 0; i < 1000; i++) sdk.trackEvent('click', { target: `button-${i}` });
    const elapsed = performance.now() - start;

    sdk.destroy();
    expect(streamed).toBe(1000);
    expect(elapsed).toBeLessThan(100);
  });
});
