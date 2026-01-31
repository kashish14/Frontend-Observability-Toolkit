import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard-landing/dashboard-landing.component').then(m => m.DashboardLandingComponent) },
      { path: 'overview', loadComponent: () => import('./features/overview/overview.component').then(m => m.OverviewComponent) },
      { path: 'performance', loadComponent: () => import('./features/performance/performance.component').then(m => m.PerformanceComponent) },
      { path: 'anomalies', loadComponent: () => import('./features/anomalies/anomalies.component').then(m => m.AnomaliesComponent) },
      { path: 'sessions', loadComponent: () => import('./features/sessions/sessions.component').then(m => m.SessionsComponent) },
      { path: 'friction', loadComponent: () => import('./features/friction/friction.component').then(m => m.FrictionComponent) },
      { path: 'logs', loadComponent: () => import('./features/event-logs/event-logs.component').then(m => m.EventLogsComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
