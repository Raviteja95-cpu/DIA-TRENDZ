import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  // Standalone routes routing directly via app central state tab triggers
  { path: '', redirectTo: '', pathMatch: 'full' },
  { 
    path: 'settings',
    loadComponent: () => import('./app.component').then(m => m.AppComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'testing',
    loadComponent: () => import('./app.component').then(m => m.AppComponent),
    canActivate: [authGuard]
  }
];
export const APP_TABS_CONFIG = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Artisan Tasks' },
  { id: 'qc', label: 'QC Review' },
  { id: 'personnel', label: 'Personnel Folder' },
  { id: 'analytics', label: 'Analytics Controls' },
  { id: 'work-reports', label: 'Work Reports' }
];
