import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, exhaustMap, pipe, tap } from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { FeedbackService } from './feedback.service';

export type FeedbackPhase = 'idle' | 'submitting' | 'done' | 'error';

interface FeedbackSubmitInput {
  sessionId: string;
  body: Dto<'SubmitFeedbackRequestDto'>;
}

/** Page-scoped — provided by the feedback widget. */
export const FeedbackStore = signalStore(
  withState<{ phase: FeedbackPhase }>({ phase: 'idle' }),
  withMethods((store) => {
    const feedbackApi = inject(FeedbackService);

    return {
      submit: rxMethod<FeedbackSubmitInput>(
        pipe(
          tap(() => patchState(store, { phase: 'submitting' })),
          // exhaustMap ignores double-taps while a submit is in flight.
          exhaustMap(({ sessionId, body }) =>
            feedbackApi.submit(sessionId, body).pipe(
              tap({
                next: () => patchState(store, { phase: 'done' }),
                error: () => patchState(store, { phase: 'error' }),
              }),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),
    };
  }),
);
