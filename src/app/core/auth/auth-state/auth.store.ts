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
  finalize,
  firstValueFrom,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import type { Dto } from '../../api/api.types';
import type { AuthState, RegisterInput, StoredAuth } from './auth.models';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'uttirno.auth';

function initialState(): AuthState {
  const empty: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    pending: false,
    error: null,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const stored = JSON.parse(raw) as Partial<StoredAuth>;
    if (!stored.user || !stored.accessToken || !stored.refreshToken) {
      return empty;
    }
    return { ...empty, ...stored };
  } catch {
    return empty; // corrupted storage — start signed out
  }
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, accessToken }) => ({
    isLoggedIn: computed(() => accessToken() !== null),
    isAdmin: computed(() => user()?.role === 'ADMIN'),
  })),
  withMethods((store) => {
    const authApi = inject(AuthService);
    // withMethods runs once per store instance, so a plain closure
    // variable gives single-flight refresh for free.
    let refreshInFlight: Promise<string | null> | null = null;

    const apply = (res: Dto<'AuthResponseDto'>): void => {
      patchState(store, {
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        error: null,
      });
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        } satisfies StoredAuth),
      );
    };

    const clear = (): void => {
      patchState(store, { user: null, accessToken: null, refreshToken: null });
      localStorage.removeItem(STORAGE_KEY);
    };

    return {
      login: rxMethod<Dto<'LoginRequestDto'>>(
        pipe(
          tap(() => patchState(store, { pending: true, error: null })),
          switchMap((body) =>
            authApi.login(body).pipe(
              tap({
                next: (res) => apply(res),
                error: () =>
                  patchState(store, { error: 'invalidCredentials' as const }),
              }),
              catchError(() => EMPTY),
              finalize(() => patchState(store, { pending: false })),
            ),
          ),
        ),
      ),

      register: rxMethod<RegisterInput>(
        pipe(
          tap(() => patchState(store, { pending: true, error: null })),
          switchMap(({ email, password, name }) =>
            authApi
              .register(name ? { email, password, name } : { email, password })
              .pipe(
                tap({
                  next: (res) => apply(res),
                  error: () =>
                    patchState(store, { error: 'registerFailed' as const }),
                }),
                catchError(() => EMPTY),
                finalize(() => patchState(store, { pending: false })),
              ),
          ),
        ),
      ),

      logout: clear,

      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Exchanges the refresh token for a new token pair. Promise-based
       * (not an rxMethod) because the interceptor must await the result.
       * Single-flight: concurrent 401s share one request. Any failure
       * signs the user out.
       */
      refresh(): Promise<string | null> {
        const refreshToken = store.refreshToken();
        if (!refreshToken) return Promise.resolve(null);
        refreshInFlight ??= (async () => {
          try {
            const res = await firstValueFrom(authApi.refresh({ refreshToken }));
            apply(res);
            return res.accessToken;
          } catch {
            clear();
            return null;
          } finally {
            refreshInFlight = null;
          }
        })();
        return refreshInFlight;
      },
    };
  }),
);
