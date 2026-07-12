import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page/home-page').then((m) => m.HomePage),
    title: 'Uttirno — উত্তীর্ণ',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
    title: 'Uttirno · Sign in',
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register-page/register-page').then(
        (m) => m.RegisterPage,
      ),
    title: 'Uttirno · Register',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
