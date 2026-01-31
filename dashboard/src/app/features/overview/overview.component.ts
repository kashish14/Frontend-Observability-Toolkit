import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservabilityApiService, Insight, AggregatedMetric, SessionSummary } from '../../core/services/observability-api.service';
import { LineChartComponent } from '../../shared/line-chart/line-chart.component';
import { HeatmapSimulationComponent } from './heatmap-simulation.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, LineChartComponent, HeatmapSimulationComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  eventsSummary: { total: number; byType: Record<string, number> } | null = null;
  insights: Insight[] | null = null;
  metrics: AggregatedMetric[] | null = null;
  sessions: SessionSummary[] | null = null;

  chartLabels: string[] = [];
  chartDatasets: { data: number[]; label: string; borderColor?: string }[] = [
    { data: [], label: 'LCP P95 (ms)', borderColor: '#1a237e' },
    { data: [], label: 'FCP P95 (ms)', borderColor: '#00bcd4' },
  ];

  constructor(private api: ObservabilityApiService) {}

  ngOnInit(): void {
    this.api.getEventsSummary().subscribe((s) => (this.eventsSummary = s));
    this.api.getInsights().subscribe((i) => (this.insights = i));
    this.api.getMetrics().subscribe((m) => {
      this.metrics = m;
      this.buildChartData(m);
    });
    this.api.getSessions().subscribe((s) => (this.sessions = s));
  }

  private buildChartData(metrics: AggregatedMetric[]): void {
    const lcp = metrics.filter((x) => x.name === 'LCP').sort((a, b) => a.periodStart - b.periodStart);
    const fcp = metrics.filter((x) => x.name === 'FCP').sort((a, b) => a.periodStart - b.periodStart);
    const labels = [...new Set([...lcp.map((x) => new Date(x.periodStart).toLocaleTimeString()), ...fcp.map((x) => new Date(x.periodStart).toLocaleTimeString())])].sort();
    this.chartLabels = labels.length ? labels : ['No data'];
    this.chartDatasets = [
      { data: lcp.map((x) => x.values.p95), label: 'LCP P95 (ms)', borderColor: '#1a237e' },
      { data: fcp.map((x) => x.values.p95), label: 'FCP P95 (ms)', borderColor: '#00bcd4' },
    ];
  }
}
