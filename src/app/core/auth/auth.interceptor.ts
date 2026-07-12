import {
  HttpErrorResponse,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api-base';
import { AuthStore } from './auth.store';

/** Endpoints that must never carry or trigger token logic. */
const NO_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
];

function withBearer(
  req: HttpRequest<unknown>,
  token: string,
): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/**
 * Attaches the access token to API requests; on a 401 it refreshes once
 * (single-flight in the store) and retries the original request. If the
 * refresh fails the user is signed out and sent to the login page.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE_URL)) return next(req);

  const store = inject(AuthStore);
  const router = inject(Router);
  const isAuthEndpoint = NO_AUTH_PATHS.some((path) => req.url.endsWith(path));
  const token = store.accessToken();
  const outgoing = token && !isAuthEndpoint ? withBearer(req, token) : req;

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      const is401 = err instanceof HttpErrorResponse && err.status === 401;
      if (!is401 || isAuthEndpoint || !store.refreshToken()) {
        return throwError(() => err);
      }
      return from(store.refresh()).pipe(
        switchMap((newToken) => {
          if (newToken) {
            // next() here does not re-enter this interceptor — the retry
            // is naturally once-only.
            return next(withBearer(req, newToken));
          }
          void router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          });
          return throwError(() => err);
        }),
      );
    }),
  );
};
