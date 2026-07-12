import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  EMPTY,
  catchError,
  concatMap,
  finalize,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';
import { QuestionsService } from '../questions-state/questions.service';

interface ReviewState {
  items: Dto<'AdminQuestionDto'>[];
  loading: boolean;
}

/**
 * Page-scoped review queue store. Approve/reject remove the card
 * optimistically; on failure the previous list is restored.
 */
export const ReviewStore = signalStore(
  withState<ReviewState>({ items: [], loading: false }),
  withMethods((store) => {
    const questionsApi = inject(QuestionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    const act = (action: 'approve' | 'reject') =>
      pipe(
        concatMap((id: string) => {
          const backup = store.items();
          patchState(store, { items: backup.filter((q) => q.id !== id) });
          const call =
            action === 'approve'
              ? questionsApi.approve(id)
              : questionsApi.reject(id);
          return call.pipe(
            tap({
              next: () =>
                toast.success(
                  action === 'approve'
                    ? i18n.t().admin.review.approvedToast
                    : i18n.t().admin.review.rejectedToast,
                ),
              error: () => {
                patchState(store, { items: backup });
                toast.error(i18n.t().admin.review.actionFailed);
              },
            }),
            catchError(() => EMPTY),
          );
        }),
      );

    return {
      load: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(() =>
            questionsApi.list({ status: 'IN_REVIEW', pageSize: 50 }).pipe(
              tap({
                next: (res) => patchState(store, { items: res.items }),
                error: () => toast.error(i18n.t().common.somethingWrong),
              }),
              catchError(() => EMPTY),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),

      approve: rxMethod<string>(act('approve')),
      reject: rxMethod<string>(act('reject')),
    };
  }),
);
