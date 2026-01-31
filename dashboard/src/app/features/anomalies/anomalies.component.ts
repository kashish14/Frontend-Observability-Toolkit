import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservabilityApiService, AnomalyResult } from '../../core/services/observability-api.service';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anomalies.component.html',
  styleUrls: ['./anomalies.component.scss'],
})
export class AnomaliesComponent implements OnInit {
  anomalies: AnomalyResult[] | null = null;

  constructor(private api: ObservabilityApiService) {}

  ngOnInit(): void {
    this.api.getAnomalies().subscribe((a) => (this.anomalies = a));
  }
}
