import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type { BtnSize, BtnVariant } from '../ui.models';

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60';

const VARIANTS: Record<BtnVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
};

// sm keeps the 44px touch target on phones and only tightens on desktop.
const SIZES: Record<BtnSize, string> = {
  sm: 'min-h-11 px-3 text-sm md:min-h-9',
  md: 'min-h-11 px-4 text-sm',
};

/**
 * Attribute-selector button: `<button app-btn variant="danger">` keeps
 * native semantics (type, disabled, form participation) for free.
 */
@Component({
  selector: 'button[app-btn], a[app-btn]',
  templateUrl: './button.html',
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.disabled]': "loading() ? '' : null",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButton {
  readonly variant = input<BtnVariant>('primary');
  readonly size = input<BtnSize>('md');
  readonly loading = input(false);

  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );
}
