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
import { QuestionReview } from '../../../shared/questions/question-review/question-review';
import { AppBadge } from '../../../shared/ui/badge/badge';
import { AppButton } from '../../../shared/ui/button/button';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PracticeStore } from '../practice-state/practice.store';

const BN_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_LABELS = ['A', 'B', 'C', 'D'];

@Component({
  selector: 'app-practice-runner-page',
  imports: [RouterLink, AppBadge, AppButton, AppEmptyState, QuestionReview],
  providers: [PracticeStore],
  templateUrl: './practice-runner-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeRunnerPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(PracticeStore);
  private readonly taxonomy = inject(TaxonomyStore);

  /** Route param via component input binding. */
  readonly topicSlug = input.required<string>();

  protected readonly topicName = computed(() => {
    const slug = this.topicSlug();
    for (const subject of this.taxonomy.subjects()) {
      const topic = subject.topics.find((t) => t.slug === slug);
      if (topic) return topic.name;
    }
    return slug;
  });

  protected readonly labels = computed(() =>
    this.store.question()?.language === 'EN' ? EN_LABELS : BN_LABELS,
  );

  constructor() {
    this.taxonomy.loadOnce();
    // rxMethod accepts a signal — re-begins when the topic param changes.
    this.store.begin(this.topicSlug);
  }

  protected optionClass(index: number): string {
    return index === this.store.selectedIndex()
      ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
      : 'border-slate-200 bg-white hover:border-slate-300';
  }
}
