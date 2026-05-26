import { Routes } from '@angular/router';

export const routes: Routes = [
  // Standalone routes routing directly via app central state tab triggers
  { path: '', redirectTo: '', pathMatch: 'full' }
];
export const APP_TABS_CONFIG = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Artisan Tasks' },
  { id: 'qc', label: 'QC Review' },
  { id: 'personnel', label: 'Personnel Folder' },
  { id: 'analytics', label: 'Analytics Controls' },
  { id: 'work-reports', label: 'Work Reports' }
];
