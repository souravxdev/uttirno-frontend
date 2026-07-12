import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api/api-base';
import { authInterceptor } from './auth.interceptor';

const STORAGE_KEY = 'uttirno.auth';
const user = {
  id: 'u1',
  email: 'admin@uttirno.test',
  name: null,
  role: 'ADMIN' as const,
};
const session = { user, accessToken: 'at-1', refreshToken: 'rt-1' };

/** Lets queued microtasks (promise chains inside the interceptor) drain. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches the bearer token to API requests', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const result = firstValueFrom(http.get(`${API_BASE_URL}/api/taxonomy/tree`));
    const req = httpMock.expectOne(`${API_BASE_URL}/api/taxonomy/tree`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer at-1');
    req.flush([]);
    await result;
  });

  it('does not attach a token to auth endpoints', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const result = firstValueFrom(
      http.post(`${API_BASE_URL}/api/auth/login`, {}),
    );
    const req = httpMock.expectOne(`${API_BASE_URL}/api/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(session);
    await result;
  });

  it('leaves non-API urls untouched', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const result = firstValueFrom(http.get('https://example.com/data'));
    const req = httpMock.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    await result;
  });

  it('on 401 refreshes once and retries with the new token', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const result = firstValueFrom(http.get(`${API_BASE_URL}/api/sessions`));

    httpMock
      .expectOne(`${API_BASE_URL}/api/sessions`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(`${API_BASE_URL}/api/auth/refresh`)
      .flush({ ...session, accessToken: 'at-2', refreshToken: 'rt-2' });
    await tick();

    const retry = httpMock.expectOne(`${API_BASE_URL}/api/sessions`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer at-2');
    retry.flush({ items: [] });
    await expect(result).resolves.toEqual({ items: [] });
  });

  it('when the refresh fails, signs out and redirects to login', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);

    const result = firstValueFrom(http.get(`${API_BASE_URL}/api/sessions`));
    void result.catch(() => undefined); // handled below via rejects

    httpMock
      .expectOne(`${API_BASE_URL}/api/sessions`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(`${API_BASE_URL}/api/auth/refresh`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    await tick();

    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/' },
    });
    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('propagates a 401 from an auth endpoint without refreshing', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const result = firstValueFrom(
      http.post(`${API_BASE_URL}/api/auth/login`, {}),
    );
    void result.catch(() => undefined);
    httpMock
      .expectOne(`${API_BASE_URL}/api/auth/login`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    httpMock.expectNone(`${API_BASE_URL}/api/auth/refresh`);
  });
});
