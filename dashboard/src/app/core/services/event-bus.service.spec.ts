import { TestBed } from '@angular/core/testing';
import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit events to stream', (done) => {
    service.events$.subscribe((event) => {
      expect(event.type).toBe('click');
      expect(event.payload).toEqual({ target: 'button' });
      done();
    });
    service.emit('click', { target: 'button' });
  });
});
