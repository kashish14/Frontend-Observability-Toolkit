import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ObservabilityApiService } from '../../core/services/observability-api.service';

@Component({
  selector: 'app-dashboard-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-landing.component.html',
  styleUrls: ['./dashboard-landing.component.scss'],
})
export class DashboardLandingComponent implements OnInit {
  eventsTotal = 0;
  insightsCount = 0;
  sessionsCount = 0;

  constructor(private api: ObservabilityApiService) {}

  ngOnInit(): void {
    this.api.getEventsSummary().subscribe((s) => (this.eventsTotal = s.total));
    this.api.getInsights().subscribe((i) => (this.insightsCount = i?.length ?? 0));
    this.api.getSessions().subscribe((s) => (this.sessionsCount = s?.length ?? 0));
  }
}
