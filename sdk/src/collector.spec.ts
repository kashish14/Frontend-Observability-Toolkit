import { Collector } from './collector';
import { Transport } from './transport';
import { MetricEvent } from './types';

describe('Collector', () => {
  let transport: Transport;
  let collector: Collector;
  const endpoint = 'http://test/api/events';

  beforeEach(() => {
    transport = new Transport({
      endpoint,
      batchSize: 10,
      flushIntervalMs: 10000,
      sampleRate: 1,
    });
    collector = new Collector(transport);
  });

  it('emits event to stream', (done) => {
    collector.stream.subscribe((event: MetricEvent) => {
      expect(event.type).toBe('render');
      expect(event.payload).toEqual({ componentId: 'Test', phase: 'render', durationMs: 10 });
      done();
    });
    collector.emit({
      type: 'render',
      timestamp: Date.now(),
      payload: { componentId: 'Test', phase: 'render', durationMs: 10 },
      context: {} as any,
    });
  });

  it('attaches context to event', (done) => {
    collector.stream.subscribe((event: MetricEvent) => {
      expect(event.context).toBeDefined();
      expect(event.context.sessionId).toBeDefined();
      expect(typeof event.context.timestamp).toBe('number');
      done();
    });
    collector.emit({
      type: 'user_event',
      timestamp: Date.now(),
      payload: { eventType: 'click' },
      context: {} as any,
    });
  });
});
