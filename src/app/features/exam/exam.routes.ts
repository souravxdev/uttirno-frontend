import { Routes } from '@angular/router';

export const EXAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./exam-config-page/exam-config-page').then(
        (m) => m.ExamConfigPage,
      ),
    title: 'Uttirno · Mock exam',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./exam-player-page/exam-player-page').then(
        (m) => m.ExamPlayerPage,
      ),
    title: 'Uttirno · Mock exam',
  },
];
