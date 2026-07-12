import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { Toast, ToastKind } from './ui.models';

const AUTO_DISMISS_MS = 3500;

export const ToastStore = signalStore(
  { providedIn: 'root' },
  withState({ toasts: [] as Toast[] }),
  withMethods((store) => {
    let nextId = 0;

    const dismiss = (id: number): void =>
      patchState(store, {
        toasts: store.toasts().filter((toast) => toast.id !== id),
      });

    const show = (kind: ToastKind, message: string): void => {
      const id = ++nextId;
      patchState(store, { toasts: [...store.toasts(), { id, kind, message }] });
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    };

    return {
      dismiss,
      success: (message: string) => show('success', message),
      error: (message: string) => show('error', message),
      info: (message: string) => show('info', message),
    };
  }),
);
