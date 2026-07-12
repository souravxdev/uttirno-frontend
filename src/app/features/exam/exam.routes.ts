import { Routes } from '@angular/router';
import { examLeaveGuard } from './exam-leave.guard';

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
    canDeactivate: [examLeaveGuard],
    title: 'Uttirno · Mock exam',
  },
  {
    path: ':id/result',
    loadComponent: () =>
      import('./exam-result-page/exam-result-page').then(
        (m) => m.ExamResultPage,
      ),
    title: 'Uttirno · Result',
  },
];
