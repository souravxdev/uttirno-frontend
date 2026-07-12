import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, finalize, pipe, switchMap, tap } from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';
import type { BrowseFilters } from './browse.models';
import { BrowseService } from './browse.service';

interface BrowseState {
  items: Dto<'PublicQuestionDto'>[];
  total: number;
  page: number;
  pageSize: number;
  filters: BrowseFilters;
  loading: boolean;
}

/** Root-provided so the chip selection and page survive navigation. */
export const BrowseStore = signalStore(
  { providedIn: 'root' },
  withState<BrowseState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filters: {},
    loading: false,
  }),
  withMethods((store) => {
    const browseApi = inject(BrowseService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    const load = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          browseApi
            .list({
              ...store.filters(),
              page: store.page(),
              pageSize: store.pageSize(),
            })
            .pipe(
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

      setSubject(subject: string | undefined): void {
        patchState(store, {
          filters: { subject, topic: undefined },
          page: 1,
        });
        load();
      },

      setTopic(topic: string | undefined): void {
        patchState(store, {
          filters: { ...store.filters(), topic },
          page: 1,
        });
        load();
      },

      setPage(page: number): void {
        patchState(store, { page });
        load();
      },
    };
  }),
);
