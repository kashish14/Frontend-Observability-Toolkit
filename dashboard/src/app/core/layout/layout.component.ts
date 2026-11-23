import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ObservabilitySdkService } from '../services/observability-sdk.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  /** True when API calls are answered by the in-app mock instead of the backend. */
  readonly demoMode = environment.enableMockBackend;

  // Injecting the service starts navigation, click and friction tracking.
  constructor(public sdk: ObservabilitySdkService) {}
}
