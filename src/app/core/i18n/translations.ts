export type Lang = 'en' | 'bn';

/**
 * System-UI strings (bilingual, runtime-switchable via LanguageStore).
 * Every UI string lives here — never hardcode user-facing text in
 * templates. Quiz CONTENT language is separate (Question.language).
 */
export const TRANSLATIONS = {
  en: {
    appTitle: 'Uttirno',
    tagline: 'BCS Preliminary exam preparation',
    languageToggle: 'বাংলা',
    apiStatus: 'API status',
    apiUp: 'Connected',
    apiDown: 'Unreachable — is the backend running?',
    apiVersion: 'version',
    checking: 'Checking…',
  },
  bn: {
    appTitle: 'উত্তীর্ণ',
    tagline: 'বিসিএস প্রিলিমিনারি প্রস্তুতি',
    languageToggle: 'English',
    apiStatus: 'এপিআই স্ট্যাটাস',
    apiUp: 'সংযুক্ত',
    apiDown: 'সংযোগ নেই — ব্যাকএন্ড চালু আছে কি?',
    apiVersion: 'সংস্করণ',
    checking: 'যাচাই চলছে…',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type TranslationKey = keyof (typeof TRANSLATIONS)['en'];
