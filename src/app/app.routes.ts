import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: '' },
];
