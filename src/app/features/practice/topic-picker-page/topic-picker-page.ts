import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-topic-picker-page',
  imports: [RouterLink, AppPageHeader],
  templateUrl: './topic-picker-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicPickerPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly taxonomy = inject(TaxonomyStore);

  constructor() {
    this.taxonomy.loadOnce();
  }
}
