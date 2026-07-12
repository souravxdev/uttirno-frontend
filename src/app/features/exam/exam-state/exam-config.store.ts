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
  exhaustMap,
  finalize,
  pipe,
  tap,
} from 'rxjs';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { SessionsService } from '../../../core/sessions/sessions-state/sessions.service';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';

interface ExamConfigState {
  questionCount: number;
  timeLimitMin: number;
  subjects: string[]; // slugs; empty = all
  creating: boolean;
  startedId: string | null;
  notEnough: boolean;
}

/** Page-scoped — provided by ExamConfigPage. Creates AND starts the session. */
export const ExamConfigStore = signalStore(
  withState<ExamConfigState>({
    questionCount: 10,
    timeLimitMin: 10,
    subjects: [],
    creating: false,
    startedId: null,
    notEnough: false,
  }),
  withComputed((store) => {
    const taxonomy = inject(TaxonomyStore);
    return {
      /** Published questions matching the current subject selection. */
      availableCount: computed(() => {
        const selected = store.subjects();
        const pool = selected.length
          ? taxonomy.subjects().filter((s) => selected.includes(s.slug))
          : taxonomy.subjects();
        return pool.reduce(
          (sum, subject) =>
            sum +
            subject.topics.reduce(
              (n, topic) => n + topic.publishedQuestionCount,
              0,
            ),
          0,
        );
      }),
    };
  }),
  withMethods((store) => {
    const sessionsApi = inject(SessionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    return {
      setCount(questionCount: number): void {
        patchState(store, { questionCount, notEnough: false });
      },

      setDuration(timeLimitMin: number): void {
        patchState(store, { timeLimitMin, notEnough: false });
      },

      toggleSubject(slug: string): void {
        const subjects = store.subjects();
        patchState(store, {
          subjects: subjects.includes(slug)
            ? subjects.filter((s) => s !== slug)
            : [...subjects, slug],
          notEnough: false,
        });
      },

      begin: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { creating: true, notEnough: false })),
          exhaustMap(() =>
            sessionsApi
              .create({
                questionCount: store.questionCount(),
                timeLimitSec: store.timeLimitMin() * 60,
                subjects: store.subjects().length
                  ? store.subjects()
                  : undefined,
              })
              .pipe(
                concatMap((session) => sessionsApi.start(session.id)),
                tap({
                  next: (play) => patchState(store, { startedId: play.id }),
                  error: (err: unknown) => {
                    if (
                      err instanceof HttpErrorResponse &&
                      err.status === 400
                    ) {
                      patchState(store, { notEnough: true });
                    } else {
                      toast.error(i18n.t().common.somethingWrong);
                    }
                  },
                }),
                catchError(() => EMPTY),
                finalize(() => patchState(store, { creating: false })),
              ),
          ),
        ),
      ),
    };
  }),
);
