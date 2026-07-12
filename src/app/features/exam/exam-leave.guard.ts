import type { CanDeactivateFn } from '@angular/router';

/**
 * Component contract for the exam-player leave guard. The player exposes
 * whether a confirmation is needed and a promise that resolves once the
 * user has chosen (via the in-page confirm dialog).
 */
export interface ExamLeaveGuarded {
  canLeave(): boolean;
  confirmLeave(): Promise<boolean>;
}

/**
 * Blocks accidental navigation away from an in-progress exam. Progress is
 * saved server-side, so this is a safety prompt, not data protection.
 */
export const examLeaveGuard: CanDeactivateFn<ExamLeaveGuarded> = (component) =>
  component.canLeave() ? true : component.confirmLeave();
