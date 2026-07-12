import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Lang, TRANSLATIONS } from '../translations';

const STORAGE_KEY = 'uttirno.lang';

function initialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'bn' || stored === 'en' ? stored : 'en';
}

export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({ lang: initialLang() })),
  withComputed(({ lang }) => ({
    t: computed(() => TRANSLATIONS[lang()]),
  })),
  withMethods((store) => ({
    toggle(): void {
      const lang: Lang = store.lang() === 'en' ? 'bn' : 'en';
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      patchState(store, { lang });
    },
  })),
  withHooks({
    onInit(store) {
      // Reflect the persisted language on <html lang> at startup, not just
      // on toggle — assistive tech and font selection rely on it.
      document.documentElement.lang = store.lang();
    },
  }),
);
