import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heatmap-simulation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap-simulation.component.html',
  styleUrls: ['./heatmap-simulation.component.scss'],
})
export class HeatmapSimulationComponent {
  @Input() rows = 8;
  @Input() cols = 12;
  cells: number[][] = [];

  ngOnInit(): void {
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c] = Math.random();
      }
    }
  }
}
