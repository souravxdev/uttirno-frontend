import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { QuestionReview } from '../../../shared/questions/question-review/question-review';
import { AppBadge } from '../../../shared/ui/badge/badge';
import { AppButton } from '../../../shared/ui/button/button';
import {
  ExamResultStore,
  type ResultFilter,
} from '../exam-state/exam-result.store';
import { FeedbackWidget } from '../feedback-widget/feedback-widget';

const FILTERS: ResultFilter[] = ['all', 'correct', 'wrong', 'skipped'];

@Component({
  selector: 'app-exam-result-page',
  imports: [RouterLink, AppBadge, AppButton, QuestionReview, FeedbackWidget],
  providers: [ExamResultStore],
  templateUrl: './exam-result-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamResultPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(ExamResultStore);
  private readonly router = inject(Router);

  /** Route param via component input binding. */
  readonly id = input.required<string>();

  protected readonly FILTERS = FILTERS;

  constructor() {
    this.store.load(this.id);

    // Not submitted yet → back into the player.
    effect(() => {
      if (this.store.notReady()) {
        void this.router.navigate(['/exam', this.id()]);
      }
    });
  }

  protected subjectPct(row: Dto<'SubjectBreakdownDto'>): number {
    const total = row.correct + row.wrong + row.skipped;
    return total > 0 ? (Math.max(0, row.score) / total) * 100 : 0;
  }

  protected filterLabel(filter: ResultFilter): string {
    return filter === 'all'
      ? this.i18n.t().results.filterAll
      : this.i18n.t().results[filter];
  }

  protected filterCount(filter: ResultFilter): number {
    const result = this.store.result();
    if (!result) return 0;
    switch (filter) {
      case 'correct':
        return result.totals.correct;
      case 'wrong':
        return result.totals.wrong;
      case 'skipped':
        return result.totals.skipped;
      default:
        return result.questionCount;
    }
  }
}
