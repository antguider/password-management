import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'passwords', 
    loadComponent: () => import('./pages/password-list/password-list.component').then(c => c.PasswordListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'passwords/new', 
    loadComponent: () => import('./pages/password-form/password-form.component').then(c => c.PasswordFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'passwords/:id', 
    loadComponent: () => import('./pages/password-detail/password-detail.component').then(c => c.PasswordDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'passwords/:id/edit', 
    loadComponent: () => import('./pages/password-form/password-form.component').then(c => c.PasswordFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'generator', 
    loadComponent: () => import('./pages/generator/generator.component').then(c => c.GeneratorComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings.component').then(c => c.SettingsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];