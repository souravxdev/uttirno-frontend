import { Routes } from '@angular/router';

export const PRACTICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./topic-picker-page/topic-picker-page').then(
        (m) => m.TopicPickerPage,
      ),
    title: 'Uttirno · Practice',
  },
  {
    path: ':topicSlug',
    loadComponent: () =>
      import('./practice-runner-page/practice-runner-page').then(
        (m) => m.PracticeRunnerPage,
      ),
    title: 'Uttirno · Practice',
  },
];
