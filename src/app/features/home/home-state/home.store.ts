import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';
import type { HealthState } from './home.models';
import { HomeService } from './home.service';

/** Page-scoped store — provided by HomePage, not root. */
export const HomeStore = signalStore(
  withState<{ health: HealthState }>({ health: { kind: 'checking' } }),
  withMethods((store) => {
    const homeApi = inject(HomeService);

    return {
      loadHealth: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { health: { kind: 'checking' } })),
          switchMap(() =>
            homeApi.health().pipe(
              tap({
                next: (res) =>
                  patchState(store, {
                    health: { kind: 'up', version: res.version },
                  }),
                error: () =>
                  patchState(store, { health: { kind: 'down' } }),
              }),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),
    };
  }),
);
