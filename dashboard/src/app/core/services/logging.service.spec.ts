import { TestBed } from '@angular/core/testing';
import { LoggingService } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should append log entries', (done) => {
    service.info('test message', 'context');
    service.getLogs$().subscribe((logs) => {
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[logs.length - 1].message).toBe('test message');
      expect(logs[logs.length - 1].level).toBe('info');
      expect(logs[logs.length - 1].context).toBe('context');
      done();
    });
  });
});
