import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * Form field wrapper: label + projected control + error/hint line.
 * Pass `forId` matching the projected control's `id` so the label is
 * properly associated. When `error` is set, the projected control is
 * wired with `aria-invalid` and `aria-describedby` pointing at the error
 * text — done here (not in every caller) since the control is projected.
 */
@Component({
  selector: 'app-field',
  templateUrl: './field.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppField {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input.required<string>();
  readonly forId = input('');
  readonly error = input<string | null>(null);
  readonly hint = input('');
  readonly required = input(false);

  protected readonly errorId = computed(() =>
    this.forId() ? `${this.forId()}-error` : null,
  );

  constructor() {
    effect(() => {
      const control = this.host.nativeElement.querySelector(
        'input, select, textarea',
      );
      if (!control) return;
      const errId = this.errorId();
      if (this.error() && errId) {
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', errId);
      } else {
        control.removeAttribute('aria-invalid');
        control.removeAttribute('aria-describedby');
      }
    });
  }
}
