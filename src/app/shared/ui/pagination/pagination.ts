import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { LanguageStore } from '../../../core/i18n/language.store';
import { AppButton } from '../button/button';

@Component({
  selector: 'app-pagination',
  imports: [AppButton],
  templateUrl: './pagination.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPagination {
  protected readonly i18n = inject(LanguageStore);

  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly from = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  protected readonly to = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );
  protected readonly canPrev = computed(() => this.page() > 1);
  protected readonly canNext = computed(
    () => this.page() * this.pageSize() < this.total(),
  );
}
