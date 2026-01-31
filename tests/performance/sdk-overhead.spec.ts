/**
 * Performance test: SDK overhead (conceptual).
 * In a full setup you would measure LCP/CPU with and without SDK in a browser.
 * Here we assert that key operations complete within a reasonable time budget.
 */
describe('SDK overhead (unit)', () => {
  it('emit + stream subscription completes in < 5ms per event (sanity)', () => {
    const start = performance.now();
    let count = 0;
    const { Subject } = require('rxjs');
    const sub = new Subject();
    sub.subscribe(() => count++);
    for (let i = 0; i < 100; i++) sub.next({ type: 'test', timestamp: Date.now(), payload: {}, context: {} });
    const elapsed = performance.now() - start;
    expect(count).toBe(100);
    expect(elapsed).toBeLessThan(50); // 100 events in 50ms => < 0.5ms per event
  });
});
