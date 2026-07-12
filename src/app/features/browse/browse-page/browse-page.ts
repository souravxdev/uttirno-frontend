import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import {
  difficultyTone,
  sourceTypeTone,
  AppBadge,
} from '../../../shared/ui/badge/badge';
import { AppButton } from '../../../shared/ui/button/button';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';
import { AppPagination } from '../../../shared/ui/pagination/pagination';
import { BrowseStore } from '../browse-state/browse.store';

const BN_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_LABELS = ['A', 'B', 'C', 'D'];

@Component({
  selector: 'app-browse-page',
  imports: [
    RouterLink,
    AppBadge,
    AppButton,
    AppEmptyState,
    AppPageHeader,
    AppPagination,
  ],
  templateUrl: './browse-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowsePage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(BrowseStore);
  protected readonly taxonomy = inject(TaxonomyStore);

  protected readonly difficultyTone = difficultyTone;
  protected readonly sourceTypeTone = sourceTypeTone;

  protected readonly topics = computed(() => {
    const subjectSlug = this.store.filters().subject;
    return subjectSlug ? this.taxonomy.topicsOf(subjectSlug) : [];
  });

  protected readonly activeTopic = computed(() => {
    const topicSlug = this.store.filters().topic;
    return topicSlug
      ? (this.topics().find((t) => t.slug === topicSlug) ?? null)
      : null;
  });

  constructor() {
    this.taxonomy.loadOnce();
    this.store.load();
  }

  protected labelsFor(language: 'BN' | 'EN'): string[] {
    return language === 'BN' ? BN_LABELS : EN_LABELS;
  }

  protected toggleTopic(slug: string): void {
    this.store.setTopic(
      this.store.filters().topic === slug ? undefined : slug,
    );
  }
}
