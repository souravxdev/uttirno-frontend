import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  EMPTY,
  catchError,
  concatMap,
  exhaustMap,
  filter,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { SessionsService } from '../../../core/sessions/sessions-state/sessions.service';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';
import type { PracticePhase } from './practice.models';

/** Untimed practice = a 1-question session with a generous time limit. */
const PRACTICE_TIME_LIMIT_SEC = 600;

interface PracticeState {
  topicSlug: string | null;
  phase: PracticePhase;
  sessionId: string | null;
  question: Dto<'SessionQuestionDto'> | null;
  selectedIndex: number | null;
  reviewItem: Dto<'SessionResultItemDto'> | null;
  attempted: number;
  correct: number;
}

/** Page-scoped — provided by PracticeRunnerPage. */
export const PracticeStore = signalStore(
  withState<PracticeState>({
    topicSlug: null,
    phase: 'loading',
    sessionId: null,
    question: null,
    selectedIndex: null,
    reviewItem: null,
    attempted: 0,
    correct: 0,
  }),
  withMethods((store) => {
    const sessionsApi = inject(SessionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    const begin = rxMethod<string>(
      pipe(
        tap((topicSlug) =>
          patchState(store, {
            topicSlug,
            phase: 'loading',
            sessionId: null,
            question: null,
            selectedIndex: null,
            reviewItem: null,
          }),
        ),
        switchMap((topicSlug) =>
          sessionsApi
            .create({
              questionCount: 1,
              timeLimitSec: PRACTICE_TIME_LIMIT_SEC,
              topics: [topicSlug],
            })
            .pipe(
              concatMap((session) => sessionsApi.start(session.id)),
              tap({
                next: (play) =>
                  patchState(store, {
                    sessionId: play.id,
                    question: play.questions[0],
                    phase: 'answering',
                  }),
                error: (err: unknown) => {
                  if (
                    err instanceof HttpErrorResponse &&
                    err.status === 400
                  ) {
                    patchState(store, { phase: 'empty' });
                  } else {
                    patchState(store, { phase: 'error' });
                    toast.error(i18n.t().common.somethingWrong);
                  }
                },
              }),
              catchError(() => EMPTY),
            ),
        ),
      ),
    );

    return {
      begin,

      select(index: number): void {
        if (store.phase() === 'answering') {
          patchState(store, { selectedIndex: index });
        }
      },

      /** Save the selection, submit the 1-question session, show feedback. */
      check: rxMethod<void>(
        pipe(
          filter(
            () =>
              store.phase() === 'answering' &&
              store.selectedIndex() !== null &&
              store.sessionId() !== null,
          ),
          tap(() => patchState(store, { phase: 'checking' })),
          exhaustMap(() => {
            const sessionId = store.sessionId()!;
            const question = store.question()!;
            return sessionsApi
              .saveAnswer(sessionId, {
                questionId: question.questionId,
                selectedIndex: store.selectedIndex(),
              })
              .pipe(
                concatMap(() => sessionsApi.submit(sessionId)),
                tap({
                  next: (result) => {
                    const item = result.items[0];
                    patchState(store, {
                      reviewItem: item,
                      phase: 'feedback',
                      attempted: store.attempted() + 1,
                      correct: store.correct() + (item.isCorrect ? 1 : 0),
                    });
                  },
                  error: () => {
                    patchState(store, { phase: 'answering' });
                    toast.error(i18n.t().common.somethingWrong);
                  },
                }),
                catchError(() => EMPTY),
              );
          }),
        ),
      ),

      next(): void {
        const topicSlug = store.topicSlug();
        if (topicSlug) begin(topicSlug);
      },
    };
  }),
);
