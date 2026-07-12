import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/auth.guards';

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
    path: 'browse',
    loadComponent: () =>
      import('./features/browse/browse-page/browse-page').then(
        (m) => m.BrowsePage,
      ),
    title: 'Uttirno · Browse',
  },
  {
    path: 'practice',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/practice/practice.routes').then(
        (m) => m.PRACTICE_ROUTES,
      ),
  },
  // /exam and /history routes land with their features (portions B and C).
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
