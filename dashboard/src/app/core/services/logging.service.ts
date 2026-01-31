import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  context?: string;
}

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private readonly logs$ = new BehaviorSubject<LogEntry[]>([]);
  private readonly maxEntries = 500;

  getLogs$() {
    return this.logs$.asObservable();
  }

  info(message: string, context?: string): void {
    this.append('info', message, context);
  }

  warn(message: string, context?: string): void {
    this.append('warn', message, context);
  }

  error(message: string, context?: string): void {
    this.append('error', message, context);
  }

  debug(message: string, context?: string): void {
    this.append('debug', message, context);
  }

  private append(level: LogEntry['level'], message: string, context?: string): void {
    const entry: LogEntry = { level, message, timestamp: Date.now(), context };
    const next = [...this.logs$.value, entry].slice(-this.maxEntries);
    this.logs$.next(next);
  }
}
