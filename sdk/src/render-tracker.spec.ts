import { Collector } from './collector';
import { Transport } from './transport';
import { RenderTracker } from './render-tracker';

describe('RenderTracker', () => {
  let collector: Collector;
  let tracker: RenderTracker;

  beforeEach(() => {
    const transport = new Transport({
      endpoint: 'http://test/api/events',
      batchSize: 10,
      flushIntervalMs: 10000,
      sampleRate: 1,
    });
    collector = new Collector(transport);
    tracker = new RenderTracker(collector);
  });

  it('trackRender emits render event', (done) => {
    collector.stream.subscribe((event) => {
      if (event.type === 'render') {
        expect((event.payload as any).componentId).toBe('AppComponent');
        expect((event.payload as any).phase).toBe('render');
        expect((event.payload as any).durationMs).toBe(25);
        done();
      }
    });
    tracker.trackRender('AppComponent', 'render', 25);
  });

  it('markStart and markEnd compute duration', (done) => {
    collector.stream.subscribe((event) => {
      if (event.type === 'render') {
        expect((event.payload as any).durationMs).toBeGreaterThanOrEqual(0);
        done();
      }
    });
    tracker.markStart('Foo');
    setTimeout(() => tracker.markEnd('Foo', 'render'), 5);
  });
});
