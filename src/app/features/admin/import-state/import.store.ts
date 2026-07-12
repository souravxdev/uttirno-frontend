import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, exhaustMap, pipe, tap } from 'rxjs';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';
import type { AiPhase, CsvPhase } from './import.models';
import { ImportService } from './import.service';

interface ImportState {
  csvPhase: CsvPhase;
  csvReport: Dto<'ImportReportDto'> | null;
  aiPhase: AiPhase;
  aiReport: Dto<'AiDraftReportDto'> | null;
}

/** Page-scoped store — provided by ImportPage. */
export const ImportStore = signalStore(
  withState<ImportState>({
    csvPhase: 'idle',
    csvReport: null,
    aiPhase: 'idle',
    aiReport: null,
  }),
  withMethods((store) => {
    const importApi = inject(ImportService);
    const toast = inject(ToastStore);
    const i18n = inject(LanguageStore);

    return {
      uploadCsv: rxMethod<File>(
        pipe(
          tap(() => patchState(store, { csvPhase: 'uploading' })),
          exhaustMap((file) =>
            importApi.uploadCsv(file).pipe(
              tap({
                next: (csvReport) =>
                  patchState(store, { csvPhase: 'done', csvReport }),
                error: () => {
                  patchState(store, { csvPhase: 'idle' });
                  toast.error(i18n.t().common.somethingWrong);
                },
              }),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),

      generateDrafts: rxMethod<Dto<'AiDraftRequestDto'>>(
        pipe(
          tap(() => patchState(store, { aiPhase: 'loading', aiReport: null })),
          exhaustMap((body) =>
            importApi.generateDrafts(body).pipe(
              tap({
                next: (aiReport) =>
                  patchState(store, { aiPhase: 'done', aiReport }),
                error: (err: unknown) => {
                  const status =
                    err instanceof HttpErrorResponse ? err.status : 0;
                  patchState(store, {
                    aiPhase: status === 503 ? 'unavailable' : 'error',
                  });
                },
              }),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),
    };
  }),
);
