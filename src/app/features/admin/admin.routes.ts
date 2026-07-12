import { Routes } from '@angular/router';
import { AdminShell } from './admin-shell/admin-shell';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'questions' },
      {
        path: 'questions',
        loadComponent: () =>
          import('./questions-list-page/questions-list-page').then(
            (m) => m.QuestionsListPage,
          ),
        title: 'Uttirno · Questions',
      },
      {
        path: 'questions/new',
        loadComponent: () =>
          import('./question-form-page/question-form-page').then(
            (m) => m.QuestionFormPage,
          ),
        title: 'Uttirno · New question',
      },
      {
        path: 'questions/:id/edit',
        loadComponent: () =>
          import('./question-form-page/question-form-page').then(
            (m) => m.QuestionFormPage,
          ),
        title: 'Uttirno · Edit question',
      },
    ],
  },
];
