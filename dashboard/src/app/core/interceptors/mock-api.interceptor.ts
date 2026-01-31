import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, delay, switchMap } from 'rxjs';
import { MockBackendService } from '../services/mock-backend.service';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const mock = inject(MockBackendService);
  let result: Observable<unknown>;

  if (req.url.includes('/api/metrics')) result = mock.getMetrics() as Observable<unknown>;
  else if (req.url.includes('/api/anomalies')) result = mock.getAnomalies() as Observable<unknown>;
  else if (req.url.includes('/api/insights')) result = mock.getInsights() as Observable<unknown>;
  else if (req.url.includes('/api/sessions')) result = mock.getSessions() as Observable<unknown>;
  else if (req.url.includes('/api/events/summary')) result = mock.getEventsSummary() as Observable<unknown>;
  else return next(req);

  return result.pipe(
    delay(200),
    switchMap((body) => of(new HttpResponse<unknown>({ status: 200, body }))),
  ) as unknown as ReturnType<HttpInterceptorFn>;
};
