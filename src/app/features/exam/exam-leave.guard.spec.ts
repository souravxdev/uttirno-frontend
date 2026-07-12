import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { examLeaveGuard, type ExamLeaveGuarded } from './exam-leave.guard';

describe('examLeaveGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  it('allows navigation without prompting when canLeave is true', () => {
    const confirmLeave = vi.fn();
    const component: ExamLeaveGuarded = { canLeave: () => true, confirmLeave };

    expect(examLeaveGuard(component, route, state, state)).toBe(true);
    expect(confirmLeave).not.toHaveBeenCalled();
  });

  it('defers to the confirmation prompt when canLeave is false', async () => {
    const pending = Promise.resolve(false);
    const component: ExamLeaveGuarded = {
      canLeave: () => false,
      confirmLeave: () => pending,
    };

    const result = examLeaveGuard(component, route, state, state);
    expect(result).toBe(pending);
    await expect(result).resolves.toBe(false);
  });
});
