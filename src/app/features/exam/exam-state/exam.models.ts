export const COUNT_PRESETS = [5, 10, 25, 50, 100] as const;

/** Minutes. The 1-minute preset doubles as the auto-submit demo. */
export const DURATION_PRESETS = [1, 5, 10, 15, 30] as const;

export type TimerTone = 'normal' | 'warn' | 'danger';

export const TIMER_WARN_SEC = 60;
export const TIMER_DANGER_SEC = 30;
