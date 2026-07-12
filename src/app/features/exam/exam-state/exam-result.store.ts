import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, finalize, pipe, switchMap, tap } from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { SessionsService } from '../../../core/sessions/sessions-state/sessions.service';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';

export type ResultFilter = 'all' | 'correct' | 'wrong' | 'skipped';

interface ExamResultState {
  result: Dto<'SessionResultDto'> | null;
  loading: boolean;
  /** 409 — session not submitted yet; component sends the user back. */
  notReady: boolean;
  filter: ResultFilter;
}

/** Page-scoped — provided by ExamResultPage. */
export const ExamResultStore = signalStore(
  withState<ExamResultState>({
    result: null,
    loading: true,
    notReady: false,
    filter: 'all',
  }),
  withComputed(({ result, filter }) => ({
    filteredItems: computed(() => {
      const items = result()?.items ?? [];
      switch (filter()) {
        case 'correct':
          return items.filter((i) => i.isCorrect === true);
        case 'wrong':
          return items.filter((i) => i.isCorrect === false);
        case 'skipped':
          return items.filter((i) => i.selectedIndex === null);
        default:
          return items;
      }
    }),
  })),
  withMethods((store) => {
    const sessionsApi = inject(SessionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    return {
      setFilter(filter: ResultFilter): void {
        patchState(store, { filter });
      },

      load: rxMethod<string>(
        pipe(
          tap(() =>
            patchState(store, { loading: true, notReady: false, result: null }),
          ),
          switchMap((id) =>
            sessionsApi.result(id).pipe(
              tap({
                next: (result) => patchState(store, { result }),
                error: (err: unknown) => {
                  if (err instanceof HttpErrorResponse && err.status === 409) {
                    patchState(store, { notReady: true });
                  } else {
                    toast.error(i18n.t().common.somethingWrong);
                  }
                },
              }),
              catchError(() => EMPTY),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),
    };
  }),
);
