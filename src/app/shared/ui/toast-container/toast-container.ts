import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageStore } from '../../../core/i18n/language.store';
import { ToastStore } from '../toast.store';
import type { ToastKind } from '../ui.models';

const KIND_BORDER: Record<ToastKind, string> = {
  success: 'border-emerald-500',
  error: 'border-red-500',
  info: 'border-primary-500',
};

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppToastContainer {
  protected readonly store = inject(ToastStore);
  protected readonly i18n = inject(LanguageStore);

  protected borderClass(kind: ToastKind): string {
    return KIND_BORDER[kind];
  }
}
