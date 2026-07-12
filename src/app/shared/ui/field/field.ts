import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Form field wrapper: label + projected control + error/hint line.
 * Pass `forId` matching the projected control's `id` so the label is
 * properly associated.
 */
@Component({
  selector: 'app-field',
  templateUrl: './field.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppField {
  readonly label = input.required<string>();
  readonly forId = input('');
  readonly error = input<string | null>(null);
  readonly hint = input('');
  readonly required = input(false);
}
