import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { ExamPalette, type PaletteItem } from '../exam-palette/exam-palette';
import { ExamPlayStore } from '../exam-state/exam-play.store';
import { ExamTimer } from '../exam-timer/exam-timer';

const BN_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_LABELS = ['A', 'B', 'C', 'D'];

@Component({
  selector: 'app-exam-player-page',
  imports: [AppButton, AppConfirmDialog, AppEmptyState, ExamPalette, ExamTimer],
  providers: [ExamPlayStore],
  templateUrl: './exam-player-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamPlayerPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(ExamPlayStore);
  private readonly router = inject(Router);

  /** Route param via component input binding. */
  readonly id = input.required<string>();

  private readonly paletteSheet =
    viewChild.required<ElementRef<HTMLDialogElement>>('paletteSheet');
  private readonly submitDlg = viewChild.required(AppConfirmDialog);

  protected readonly labels = computed(() =>
    this.store.current()?.language === 'EN' ? EN_LABELS : BN_LABELS,
  );

  protected readonly paletteItems = computed((): PaletteItem[] =>
    this.store.questions().map((q) => ({ answered: q.selectedIndex !== null })),
  );

  protected readonly submitMessage = computed(() => {
    const unanswered = this.store.total() - this.store.answeredCount();
    return unanswered > 0
      ? `${unanswered} ${this.i18n.t().exam.unansweredWarning}`
      : this.i18n.t().exam.allAnswered;
  });

  constructor() {
    this.store.load(this.id);

    effect(() => {
      if (this.store.finished()) {
        void this.router.navigate(['/exam', this.id(), 'result']);
      }
    });
  }

  protected optionClass(index: number): string {
    return index === this.store.current()?.selectedIndex
      ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
      : 'border-slate-200 bg-white hover:border-slate-300';
  }

  protected openSubmit(): void {
    this.submitDlg().open();
  }

  protected openPalette(): void {
    this.paletteSheet().nativeElement.showModal();
  }

  protected jumpAndClose(index: number): void {
    this.store.jumpTo(index);
    this.paletteSheet().nativeElement.close();
  }

  protected retry(): void {
    this.store.load(this.id());
  }
}
