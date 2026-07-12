import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppButton } from '../../../shared/ui/button/button';
import { FeedbackStore } from '../feedback-state/feedback.store';

const STARS = [1, 2, 3, 4, 5] as const;

/** Star-rating + optional comment on the exam result page. Page-scoped store. */
@Component({
  selector: 'app-feedback-widget',
  imports: [AppButton],
  providers: [FeedbackStore],
  templateUrl: './feedback-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackWidget {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(FeedbackStore);

  readonly sessionId = input.required<string>();

  protected readonly STARS = STARS;
  protected readonly rating = signal(0);
  protected readonly comment = signal('');

  protected setRating(value: number): void {
    this.rating.set(value);
  }

  protected updateComment(event: Event): void {
    this.comment.set((event.target as HTMLTextAreaElement).value);
  }

  protected submit(): void {
    if (this.rating() < 1) return;
    const comment = this.comment().trim();
    this.store.submit({
      sessionId: this.sessionId(),
      body: { rating: this.rating(), comment: comment || undefined },
    });
  }
}
