import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { adminGuard, authGuard } from './auth.guards';

const STORAGE_KEY = 'uttirno.auth';

function seedSession(role: 'ADMIN' | 'LEARNER'): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: { id: 'u1', email: 'x@y.test', name: null, role },
      accessToken: 'at',
      refreshToken: 'rt',
    }),
  );
}

function run(guard: CanActivateFn, url = '/admin/questions') {
  return TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  );
}

describe('auth guards', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('authGuard redirects signed-out users to login with returnUrl', () => {
    const result = run(authGuard) as UrlTree;
    expect(result.toString()).toBe('/auth/login?returnUrl=%2Fadmin%2Fquestions');
  });

  it('authGuard admits signed-in users', () => {
    seedSession('LEARNER');
    expect(run(authGuard)).toBe(true);
  });

  it('adminGuard redirects signed-out users to login', () => {
    const result = run(adminGuard) as UrlTree;
    expect(result.toString()).toContain('/auth/login');
  });

  it('adminGuard bounces non-admins home', () => {
    seedSession('LEARNER');
    const result = run(adminGuard) as UrlTree;
    expect(result.toString()).toBe('/');
  });

  it('adminGuard admits admins', () => {
    seedSession('ADMIN');
    expect(run(adminGuard)).toBe(true);
  });
});
