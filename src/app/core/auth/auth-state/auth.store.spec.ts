import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../api/api-base';
import { AuthStore } from './auth.store';

const STORAGE_KEY = 'uttirno.auth';
const user = {
  id: 'u1',
  email: 'admin@uttirno.test',
  name: null,
  role: 'ADMIN' as const,
};
const session = { user, accessToken: 'at-1', refreshToken: 'rt-1' };

describe('AuthStore', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts signed out with empty storage', () => {
    const store = TestBed.inject(AuthStore);
    expect(store.isLoggedIn()).toBe(false);
    expect(store.isAdmin()).toBe(false);
  });

  it('hydrates a persisted session', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const store = TestBed.inject(AuthStore);
    expect(store.isLoggedIn()).toBe(true);
    expect(store.isAdmin()).toBe(true);
    expect(store.accessToken()).toBe('at-1');
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const store = TestBed.inject(AuthStore);
    expect(store.isLoggedIn()).toBe(false);
  });

  it('login stores the session and persists it', () => {
    const store = TestBed.inject(AuthStore);
    store.login({ email: 'admin@uttirno.test', password: 'pw' });
    const req = httpMock.expectOne(`${API_BASE_URL}/api/auth/login`);
    expect(req.request.body).toEqual({
      email: 'admin@uttirno.test',
      password: 'pw',
    });
    expect(store.pending()).toBe(true);
    req.flush(session);
    expect(store.pending()).toBe(false);
    expect(store.isLoggedIn()).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(session);
  });

  it('failed login sets the error key and keeps the rxMethod alive', () => {
    const store = TestBed.inject(AuthStore);
    store.login({ email: 'a@b.c', password: 'wrong' });
    httpMock
      .expectOne(`${API_BASE_URL}/api/auth/login`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(store.error()).toBe('invalidCredentials');
    expect(store.pending()).toBe(false);
    expect(store.isLoggedIn()).toBe(false);

    // The pipeline must survive the error and accept the next call.
    store.login({ email: 'a@b.c', password: 'right' });
    const retry = httpMock.expectOne(`${API_BASE_URL}/api/auth/login`);
    retry.flush(session);
    expect(store.isLoggedIn()).toBe(true);
  });

  it('register omits an empty name and signs the user in', () => {
    const store = TestBed.inject(AuthStore);
    store.register({ email: 'new@uttirno.test', password: 'longenough' });
    const req = httpMock.expectOne(`${API_BASE_URL}/api/auth/register`);
    expect(req.request.body).toEqual({
      email: 'new@uttirno.test',
      password: 'longenough',
    });
    req.flush(session);
    expect(store.isLoggedIn()).toBe(true);
  });

  it('refresh is single-flight: concurrent calls share one request', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const store = TestBed.inject(AuthStore);
    const first = store.refresh();
    const second = store.refresh();
    const requests = httpMock.match(`${API_BASE_URL}/api/auth/refresh`);
    expect(requests).toHaveLength(1);
    requests[0].flush({ ...session, accessToken: 'at-2', refreshToken: 'rt-2' });
    await expect(first).resolves.toBe('at-2');
    await expect(second).resolves.toBe('at-2');
    expect(store.accessToken()).toBe('at-2');
  });

  it('failed refresh signs the user out', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const store = TestBed.inject(AuthStore);
    const result = store.refresh();
    httpMock
      .expectOne(`${API_BASE_URL}/api/auth/refresh`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    await expect(result).resolves.toBeNull();
    expect(store.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('logout clears state and storage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const store = TestBed.inject(AuthStore);
    store.logout();
    expect(store.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
