import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, filter, finalize, pipe, switchMap, tap } from 'rxjs';
import type { Dto } from '../../api/api.types';
import { TaxonomyService } from './taxonomy.service';

interface TaxonomyState {
  tree: Dto<'ExamTreeDto'>[];
  loaded: boolean;
  loading: boolean;
}

export const TaxonomyStore = signalStore(
  { providedIn: 'root' },
  withState<TaxonomyState>({ tree: [], loaded: false, loading: false }),
  withComputed(({ tree }) => ({
    // POC scope is BCS Preliminary only — the first (single) exam.
    subjects: computed(() => tree()[0]?.subjects ?? []),
  })),
  withMethods((store) => {
    const taxonomyApi = inject(TaxonomyService);

    return {
      /** Topics of one subject, by subject id or slug. */
      topicsOf(subjectKey: string): Dto<'SubjectTreeDto'>['topics'] {
        const subject = store
          .subjects()
          .find((s) => s.id === subjectKey || s.slug === subjectKey);
        return subject?.topics ?? [];
      },

      loadOnce: rxMethod<void>(
        pipe(
          filter(() => !store.loaded() && !store.loading()),
          tap(() => patchState(store, { loading: true })),
          switchMap(() =>
            taxonomyApi.tree().pipe(
              tap({
                next: (tree) => patchState(store, { tree, loaded: true }),
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
