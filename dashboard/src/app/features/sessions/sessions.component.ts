import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservabilityApiService, SessionSummary } from '../../core/services/observability-api.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss'],
})
export class SessionsComponent implements OnInit {
  sessions: SessionSummary[] | null = null;

  constructor(private api: ObservabilityApiService) {}

  ngOnInit(): void {
    this.api.getSessions().subscribe((s) => (this.sessions = s));
  }
}
