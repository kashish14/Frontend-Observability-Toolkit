import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservabilityApiService, SessionSummary } from '../../core/services/observability-api.service';

@Component({
  selector: 'app-friction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friction.component.html',
  styleUrls: ['./friction.component.scss'],
})
export class FrictionComponent implements OnInit {
  sessions: SessionSummary[] | null = null;
  totalFriction = 0;
  sessionsWithFriction = 0;
  sessionsWithFrictionList: SessionSummary[] = [];

  constructor(private api: ObservabilityApiService) {}

  ngOnInit(): void {
    this.api.getSessions().subscribe((s) => {
      this.sessions = s;
      this.totalFriction = s?.reduce((sum, x) => sum + x.frictionCount, 0) ?? 0;
      this.sessionsWithFrictionList = s?.filter((x) => x.frictionCount > 0) ?? [];
      this.sessionsWithFriction = this.sessionsWithFrictionList.length;
    });
  }
}
