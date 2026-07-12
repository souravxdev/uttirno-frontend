import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-topic-picker-page',
  imports: [RouterLink, AppButton, AppPageHeader],
  templateUrl: './topic-picker-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicPickerPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly taxonomy = inject(TaxonomyStore);

  /** Optional `?subject=slug` query param — pre-filters to one subject. */
  readonly subject = input<string>();

  /** All subjects, or just the requested one when the filter is active. */
  protected readonly subjects = computed(() => {
    const all = this.taxonomy.subjects();
    const slug = this.subject();
    if (!slug) return all;
    const match = all.filter((s) => s.slug === slug);
    return match.length > 0 ? match : all;
  });

  protected readonly filtered = computed(
    () => !!this.subject() && this.subjects().length === 1,
  );

  constructor() {
    this.taxonomy.loadOnce();
  }
}
