import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

const SIZES = { sm: 'size-4', md: 'size-6', lg: 'size-8' } as const;

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.html',
  host: { class: 'inline-flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSpinner {
  readonly size = input<keyof typeof SIZES>('md');

  protected readonly sizeClass = computed(() => SIZES[this.size()]);
}
