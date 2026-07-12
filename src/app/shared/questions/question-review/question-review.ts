import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppBadge } from '../../ui/badge/badge';
import type { BadgeTone } from '../../ui/ui.models';
import type { QuestionReviewVm, ReviewOutcome } from '../questions.models';

const BN_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_LABELS = ['A', 'B', 'C', 'D'];

const OUTCOME_TONES: Record<ReviewOutcome, BadgeTone> = {
  correct: 'emerald',
  wrong: 'rose',
  skipped: 'amber',
};

/**
 * Post-submission learner view of one question: the correct option is
 * highlighted, a wrong selection is marked, explanation below.
 */
@Component({
  selector: 'app-question-review',
  imports: [AppBadge],
  templateUrl: './question-review.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionReview {
  protected readonly i18n = inject(LanguageStore);

  readonly question = input.required<QuestionReviewVm>();
  readonly ordinal = input<number | null>(null);

  protected readonly labels = computed(() =>
    this.question().language === 'BN' ? BN_LABELS : EN_LABELS,
  );

  protected readonly outcome = computed<ReviewOutcome>(() => {
    const q = this.question();
    if (q.selectedIndex === null) return 'skipped';
    return q.selectedIndex === q.correctIndex ? 'correct' : 'wrong';
  });

  protected readonly outcomeTone = computed(() => OUTCOME_TONES[this.outcome()]);

  protected optionClass(index: number): string {
    const q = this.question();
    if (index === q.correctIndex) return 'border-emerald-400 bg-emerald-50';
    if (index === q.selectedIndex) return 'border-rose-400 bg-rose-50';
    return 'border-slate-200';
  }
}
