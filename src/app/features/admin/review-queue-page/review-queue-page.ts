import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import {
  difficultyTone,
  sourceTypeTone,
  AppBadge,
} from '../../../shared/ui/badge/badge';
import { AppButton } from '../../../shared/ui/button/button';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';
import { QuestionPreview } from '../question-preview/question-preview';
import type { QuestionPreviewVm } from '../questions-state/questions.models';
import { ReviewStore } from '../review-state/review.store';

@Component({
  selector: 'app-review-queue-page',
  imports: [
    RouterLink,
    AppBadge,
    AppButton,
    AppEmptyState,
    AppPageHeader,
    QuestionPreview,
  ],
  providers: [ReviewStore],
  templateUrl: './review-queue-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewQueuePage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(ReviewStore);

  protected readonly difficultyTone = difficultyTone;
  protected readonly sourceTypeTone = sourceTypeTone;

  constructor() {
    this.store.load();
  }

  protected vmOf(q: Dto<'AdminQuestionDto'>): QuestionPreviewVm {
    return {
      stem: q.stem,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      language: q.language,
    };
  }
}
