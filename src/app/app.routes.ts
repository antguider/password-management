import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  { 
    path: 'passwords', 
    loadComponent: () => import('./pages/password-list/password-list.component').then(c => c.PasswordListComponent)
  },
  { 
    path: 'passwords/new', 
    loadComponent: () => import('./pages/password-form/password-form.component').then(c => c.PasswordFormComponent)
  },
  { 
    path: 'passwords/:id', 
    loadComponent: () => import('./pages/password-detail/password-detail.component').then(c => c.PasswordDetailComponent)
  },
  { 
    path: 'passwords/:id/edit', 
    loadComponent: () => import('./pages/password-form/password-form.component').then(c => c.PasswordFormComponent)
  },
  { 
    path: 'generator', 
    loadComponent: () => import('./pages/generator/generator.component').then(c => c.GeneratorComponent)
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings.component').then(c => c.SettingsComponent)
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];