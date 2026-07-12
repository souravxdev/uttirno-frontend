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
import type { QuestionsFilters } from './questions.models';
import { QuestionsService } from './questions.service';

interface AdminQuestionsState {
  items: Dto<'AdminQuestionDto'>[];
  total: number;
  page: number;
  pageSize: number;
  filters: QuestionsFilters;
  loading: boolean;
  loadError: boolean;
}

/** Root-provided so list filters survive admin tab switches. */
export const AdminQuestionsStore = signalStore(
  { providedIn: 'root' },
  withState<AdminQuestionsState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    filters: {},
    loading: false,
    loadError: false,
  }),
  withComputed(({ filters }) => ({
    activeFilterCount: computed(
      () => Object.values(filters()).filter((v) => v != null && v !== '').length,
    ),
  })),
  withMethods((store) => {
    const questionsApi = inject(QuestionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    const load = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, loadError: false })),
        switchMap(() =>
          questionsApi
            .list({
              ...store.filters(),
              page: store.page(),
              pageSize: store.pageSize(),
            })
            .pipe(
              tap({
                next: (res) =>
                  patchState(store, { items: res.items, total: res.total }),
                error: () => patchState(store, { loadError: true }),
              }),
              catchError(() => EMPTY),
              finalize(() => patchState(store, { loading: false })),
            ),
        ),
      ),
    );

    return {
      load,

      setFilters(patch: Partial<QuestionsFilters>): void {
        patchState(store, {
          filters: { ...store.filters(), ...patch },
          page: 1,
        });
        load();
      },

      clearFilters(): void {
        patchState(store, { filters: {}, page: 1 });
        load();
      },

      setPage(page: number): void {
        patchState(store, { page });
        load();
      },

      remove: rxMethod<string>(
        pipe(
          concatMap((id) =>
            questionsApi.remove(id).pipe(
              tap({
                next: () => {
                  toast.success(i18n.t().admin.questions.deleted);
                  load();
                },
                error: (err: unknown) =>
                  toast.error(
                    err instanceof HttpErrorResponse && err.status === 409
                      ? i18n.t().admin.questions.deleteConflict
                      : i18n.t().common.somethingWrong,
                  ),
              }),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),

      approve: rxMethod<string>(
        pipe(
          concatMap((id) =>
            questionsApi.approve(id).pipe(
              tap({
                next: (updated) => {
                  patchState(store, {
                    items: store
                      .items()
                      .map((q) => (q.id === updated.id ? updated : q)),
                  });
                  toast.success(i18n.t().admin.questions.approved);
                },
                error: () => toast.error(i18n.t().common.somethingWrong),
              }),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),
    };
  }),
);
