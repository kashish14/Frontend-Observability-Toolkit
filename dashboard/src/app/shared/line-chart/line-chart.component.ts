import { Component, Input, OnChanges, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() labels: string[] = [];
  @Input() datasets: { data: number[]; label: string; borderColor?: string }[] = [];
  private chart: Chart<'line'> | null = null;

  ngAfterViewInit(): void {
    this.draw();
  }

  ngOnChanges(): void {
    if (this.chart) this.draw();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private draw(): void {
    if (!this.canvasRef?.nativeElement) return;
    this.chart?.destroy();
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.labels.length ? this.labels : ['No data'],
        datasets: this.datasets.map((d, i) => ({
          data: d.data,
          label: d.label,
          borderColor: d.borderColor ?? (i === 0 ? '#1a237e' : '#00bcd4'),
          fill: false,
          tension: 0.2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: true },
          y: { display: true, beginAtZero: true },
        },
      },
    };
    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
