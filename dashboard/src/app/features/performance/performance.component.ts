import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservabilityApiService, AggregatedMetric } from '../../core/services/observability-api.service';
import { BarChartComponent } from '../../shared/bar-chart/bar-chart.component';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss'],
})
export class PerformanceComponent implements OnInit {
  metrics: AggregatedMetric[] | null = null;
  barLabels: string[] = [];
  barData: number[] = [];

  constructor(private api: ObservabilityApiService) {}

  ngOnInit(): void {
    this.api.getMetrics().subscribe((m) => {
      this.metrics = [...(m ?? [])].sort((a, b) => a.name.localeCompare(b.name) || a.periodStart - b.periodStart);
      const sorted = [...(m ?? [])].sort((a, b) => a.periodStart - b.periodStart);
      this.barLabels = sorted.map((x) => `${x.name} @ ${new Date(x.periodStart).toLocaleTimeString()}`);
      this.barData = sorted.map((x) => x.values.p95);
    });
  }
}
