import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api/api-base';
import type { Dto } from '../api/api.types';
import type { AuthErrorKey, AuthState, StoredAuth } from './auth.models';

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
    const http = inject(HttpClient);
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

    const authenticate = async (
      path: '/api/auth/login' | '/api/auth/register',
      body: Dto<'LoginRequestDto'> | Dto<'RegisterRequestDto'>,
      errorKey: AuthErrorKey,
    ): Promise<boolean> => {
      patchState(store, { pending: true, error: null });
      try {
        const res = await firstValueFrom(
          http.post<Dto<'AuthResponseDto'>>(`${API_BASE_URL}${path}`, body),
        );
        apply(res);
        return true;
      } catch {
        patchState(store, { error: errorKey });
        return false;
      } finally {
        patchState(store, { pending: false });
      }
    };

    return {
      login: (email: string, password: string): Promise<boolean> =>
        authenticate('/api/auth/login', { email, password }, 'invalidCredentials'),

      register: (
        email: string,
        password: string,
        name?: string,
      ): Promise<boolean> =>
        authenticate(
          '/api/auth/register',
          name ? { email, password, name } : { email, password },
          'registerFailed',
        ),

      logout: clear,

      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Exchanges the refresh token for a new token pair. Single-flight:
       * concurrent 401s share one request. Any failure signs the user out.
       */
      refresh(): Promise<string | null> {
        const refreshToken = store.refreshToken();
        if (!refreshToken) return Promise.resolve(null);
        refreshInFlight ??= (async () => {
          try {
            const res = await firstValueFrom(
              http.post<Dto<'AuthResponseDto'>>(
                `${API_BASE_URL}/api/auth/refresh`,
                { refreshToken } satisfies Dto<'RefreshRequestDto'>,
              ),
            );
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
