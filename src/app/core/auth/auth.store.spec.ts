import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api/api-base';
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

  it('login stores the session and persists it', async () => {
    const store = TestBed.inject(AuthStore);
    const result = store.login('admin@uttirno.test', 'pw');
    const req = httpMock.expectOne(`${API_BASE_URL}/api/auth/login`);
    expect(req.request.body).toEqual({
      email: 'admin@uttirno.test',
      password: 'pw',
    });
    req.flush(session);
    await expect(result).resolves.toBe(true);
    expect(store.isLoggedIn()).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(session);
  });

  it('failed login sets the error key and stays signed out', async () => {
    const store = TestBed.inject(AuthStore);
    const result = store.login('a@b.c', 'wrong');
    httpMock
      .expectOne(`${API_BASE_URL}/api/auth/login`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    await expect(result).resolves.toBe(false);
    expect(store.error()).toBe('invalidCredentials');
    expect(store.isLoggedIn()).toBe(false);
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
