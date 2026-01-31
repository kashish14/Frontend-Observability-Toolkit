import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-event-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-logs.component.html',
  styleUrls: ['./event-logs.component.scss'],
})
export class EventLogsComponent implements OnInit {
  logs: { level: string; message: string; timestamp: number; context?: string }[] = [];

  constructor(private logging: LoggingService) {}

  ngOnInit(): void {
    this.logging.getLogs$().subscribe((entries) => (this.logs = entries.slice(-100).reverse()));
  }
}
