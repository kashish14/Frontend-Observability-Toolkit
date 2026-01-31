import { ErrorHandler, Injectable } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import { EventBusService } from '../services/event-bus.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private logging: LoggingService,
    private eventBus: EventBusService,
  ) {}

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    this.logging.error(message, stack);
    this.eventBus.emit('error', { message, stack });
  }
}
