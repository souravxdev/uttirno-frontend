import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  EMPTY,
  catchError,
  concatMap,
  exhaustMap,
  filter,
  finalize,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import type { Dto, SessionStatus } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { SessionsService } from '../../../core/sessions/sessions-state/sessions.service';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';
import {
  TIMER_DANGER_SEC,
  TIMER_WARN_SEC,
  type TimerTone,
} from './exam.models';

const TICK_MS = 500;

interface ExamPlayState {
  sessionId: string | null;
  status: SessionStatus | null;
  questions: Dto<'SessionQuestionDto'>[];
  currentIndex: number;
  /** Wall-clock deadline. Set ONLY from server remainingSec values. */
  deadlineMs: number | null;
  nowMs: number;
  loading: boolean;
  submitting: boolean;
  /** Session is over (submitted/expired) — component navigates to result. */
  finished: boolean;
  loadError: boolean;
}

/** Page-scoped — provided by ExamPlayerPage. */
export const ExamPlayStore = signalStore(
  withState<ExamPlayState>({
    sessionId: null,
    status: null,
    questions: [],
    currentIndex: 0,
    deadlineMs: null,
    nowMs: 0,
    loading: true,
    submitting: false,
    finished: false,
    loadError: false,
  }),
  withComputed(({ questions, currentIndex, deadlineMs, nowMs }) => ({
    current: computed(() => questions()[currentIndex()] ?? null),
    total: computed(() => questions().length),
    answeredCount: computed(
      () => questions().filter((q) => q.selectedIndex !== null).length,
    ),
    isLast: computed(() => currentIndex() === questions().length - 1),
    remainingSec: computed(() => {
      const deadline = deadlineMs();
      if (deadline === null) return null;
      return Math.max(0, Math.ceil((deadline - nowMs()) / 1000));
    }),
  })),
  withComputed(({ remainingSec }) => ({
    timerTone: computed((): TimerTone => {
      const sec = remainingSec();
      if (sec === null || sec > TIMER_WARN_SEC) return 'normal';
      return sec > TIMER_DANGER_SEC ? 'warn' : 'danger';
    }),
  })),
  withMethods((store) => {
    const sessionsApi = inject(SessionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    /** The only way the clock is ever set — server remainingSec is truth. */
    const sync = (remainingSec: number): void =>
      patchState(store, {
        deadlineMs: Date.now() + remainingSec * 1000,
        nowMs: Date.now(),
      });

    const saveAnswer = rxMethod<Dto<'SaveAnswerRequestDto'>>(
      pipe(
        // concatMap keeps saves ordered — last selection wins server-side.
        concatMap((body) =>
          sessionsApi.saveAnswer(store.sessionId()!, body).pipe(
            tap({
              next: (ack) => sync(ack.remainingSec),
              error: (err: unknown) => {
                if (err instanceof HttpErrorResponse && err.status === 409) {
                  patchState(store, { finished: true }); // expired server-side
                } else {
                  toast.error(i18n.t().exam.saveFailed);
                }
              },
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    );

    const submit = rxMethod<void>(
      pipe(
        filter(() => store.sessionId() !== null && !store.finished()),
        tap(() => patchState(store, { submitting: true })),
        exhaustMap(() =>
          sessionsApi.submit(store.sessionId()!).pipe(
            tap({
              next: () => patchState(store, { finished: true }),
              error: (err: unknown) => {
                if (err instanceof HttpErrorResponse && err.status === 409) {
                  patchState(store, { finished: true }); // already over
                } else {
                  toast.error(i18n.t().common.somethingWrong);
                }
              },
            }),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { submitting: false })),
          ),
        ),
      ),
    );

    const applyPlay = (play: Dto<'SessionPlayStateDto'>): void => {
      if (play.status === 'SUBMITTED' || play.status === 'EXPIRED') {
        patchState(store, { finished: true });
        return;
      }
      patchState(store, {
        sessionId: play.id,
        status: play.status,
        questions: play.questions,
      });
      if (play.remainingSec !== null) sync(play.remainingSec);
    };

    return {
      submit,

      load: rxMethod<string>(
        pipe(
          tap(() =>
            patchState(store, {
              loading: true,
              loadError: false,
              finished: false,
            }),
          ),
          switchMap((id) =>
            sessionsApi.play(id).pipe(
              // Resumed before it was ever started (e.g. from history).
              concatMap((play) =>
                play.status === 'CREATED' ? sessionsApi.start(id) : of(play),
              ),
              tap({
                next: (play) => applyPlay(play),
                error: () => patchState(store, { loadError: true }),
              }),
              catchError(() => EMPTY),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),

      /** Optimistic local selection + ordered server save. null clears. */
      select(index: number | null): void {
        const question = store.current();
        if (!question || store.finished() || store.sessionId() === null) return;
        patchState(store, {
          questions: store
            .questions()
            .map((q, i) =>
              i === store.currentIndex() ? { ...q, selectedIndex: index } : q,
            ),
        });
        saveAnswer({ questionId: question.questionId, selectedIndex: index });
      },

      next(): void {
        patchState(store, {
          currentIndex: Math.min(
            store.currentIndex() + 1,
            store.questions().length - 1,
          ),
        });
      },

      prev(): void {
        patchState(store, {
          currentIndex: Math.max(store.currentIndex() - 1, 0),
        });
      },

      jumpTo(index: number): void {
        if (index >= 0 && index < store.questions().length) {
          patchState(store, { currentIndex: index });
        }
      },
    };
  }),
  withHooks((store) => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let autoSubmitted = false;
    return {
      onInit() {
        intervalId = setInterval(() => {
          patchState(store, { nowMs: Date.now() });
          const deadline = store.deadlineMs();
          if (
            deadline !== null &&
            Date.now() >= deadline &&
            !store.finished() &&
            !autoSubmitted
          ) {
            autoSubmitted = true; // fires exactly once
            store.submit();
          }
        }, TICK_MS);
      },
      onDestroy() {
        clearInterval(intervalId);
      },
    };
  }),
);
