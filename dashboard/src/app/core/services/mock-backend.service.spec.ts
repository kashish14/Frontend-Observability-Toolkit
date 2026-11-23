import { TestBed } from '@angular/core/testing';
import { MockBackendService } from './mock-backend.service';

describe('MockBackendService', () => {
  let service: MockBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getMetrics should return observable of array', (done) => {
    service.getMetrics().subscribe((m) => {
      expect(Array.isArray(m)).toBe(true);
      expect(m.length).toBeGreaterThan(0);
      expect(m[0].name).toBeDefined();
      expect(m[0].values).toBeDefined();
      done();
    });
  });

  it('getSessions should return observable of array', (done) => {
    service.getSessions().subscribe((s) => {
      expect(Array.isArray(s)).toBe(true);
      expect(s.length).toBeGreaterThan(0);
      expect(s[0].sessionId).toBeDefined();
      done();
    });
  });
});
