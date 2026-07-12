import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, finalize, pipe, switchMap, tap } from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';
import {
  isValidationErrorBody,
  type QuestionSaveInput,
  type ValidationIssue,
} from './questions.models';
import { QuestionsService } from './questions.service';

interface QuestionFormState {
  question: Dto<'AdminQuestionDto'> | null;
  loading: boolean;
  notFound: boolean;
  saving: boolean;
  saved: Dto<'AdminQuestionDto'> | null;
  issues: ValidationIssue[];
}

/** Page-scoped store — provided by QuestionFormPage, not root. */
export const QuestionFormStore = signalStore(
  withState<QuestionFormState>({
    question: null,
    loading: false,
    notFound: false,
    saving: false,
    saved: null,
    issues: [],
  }),
  withMethods((store) => {
    const questionsApi = inject(QuestionsService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    return {
      load: rxMethod<string>(
        pipe(
          tap(() =>
            patchState(store, { loading: true, notFound: false, question: null }),
          ),
          switchMap((id) =>
            questionsApi.byId(id).pipe(
              tap({
                next: (question) => patchState(store, { question }),
                error: () => patchState(store, { notFound: true }),
              }),
              catchError(() => EMPTY),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),

      save: rxMethod<QuestionSaveInput>(
        pipe(
          tap(() => patchState(store, { saving: true, issues: [] })),
          switchMap((input) =>
            (input.id === null
              ? questionsApi.create(input.body)
              : questionsApi.update(input.id, input.body)
            ).pipe(
              tap({
                next: (saved) => {
                  toast.success(i18n.t().admin.form.saved);
                  patchState(store, { saved });
                },
                error: (err: unknown) => {
                  if (
                    err instanceof HttpErrorResponse &&
                    err.status === 400 &&
                    isValidationErrorBody(err.error)
                  ) {
                    patchState(store, { issues: err.error.errors });
                  } else {
                    toast.error(i18n.t().common.somethingWrong);
                  }
                },
              }),
              catchError(() => EMPTY),
              finalize(() => patchState(store, { saving: false })),
            ),
          ),
        ),
      ),
    };
  }),
);
