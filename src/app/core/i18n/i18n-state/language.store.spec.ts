import { TestBed } from '@angular/core/testing';
import { LanguageStore } from './language.store';

const STORAGE_KEY = 'uttirno.lang';

describe('LanguageStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to English and reflects it on <html lang> at init', () => {
    const store = TestBed.inject(LanguageStore);
    expect(store.lang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('hydrates the persisted language onto <html lang> at init', () => {
    localStorage.setItem(STORAGE_KEY, 'bn');
    const store = TestBed.inject(LanguageStore);
    expect(store.lang()).toBe('bn');
    expect(document.documentElement.lang).toBe('bn');
    expect(store.t().common.retry).toBe('আবার চেষ্টা করুন');
  });

  it('toggle updates the language, storage and <html lang>', () => {
    const store = TestBed.inject(LanguageStore);
    store.toggle();
    expect(store.lang()).toBe('bn');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('bn');
    expect(document.documentElement.lang).toBe('bn');
  });
});
