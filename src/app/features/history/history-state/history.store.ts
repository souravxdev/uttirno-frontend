import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, finalize, pipe, switchMap, tap } from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { SessionsService } from '../../../core/sessions/sessions-state/sessions.service';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';

interface HistoryState {
  items: Dto<'SessionSummaryDto'>[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
}

/** Root-provided so the page position survives navigation. */
export const HistoryStore = signalStore(
  { providedIn: 'root' },
  withState<HistoryState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
  }),
  withMethods((store) => {
    const sessionsApi = inject(SessionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    const load = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          sessionsApi.history(store.page(), store.pageSize()).pipe(
            tap({
              next: (res) =>
                patchState(store, { items: res.items, total: res.total }),
              error: () => toast.error(i18n.t().common.somethingWrong),
            }),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    );

    return {
      load,

      setPage(page: number): void {
        patchState(store, { page });
        load();
      },
    };
  }),
);
