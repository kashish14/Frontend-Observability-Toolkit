import { Component, Input, OnChanges, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label = 'Value';
  private chart: Chart<'bar'> | null = null;

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
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.labels.length ? this.labels : ['No data'],
        datasets: [{ data: this.data, label: this.label, backgroundColor: '#1a237e99' }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: true },
          y: { beginAtZero: true },
        },
      },
    };
    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
