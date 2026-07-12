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
import { AnalyticsService } from '../../../core/analytics/analytics-state/analytics.service';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import type { ExamLeaveGuarded } from '../exam-leave.guard';
import { ExamPalette, type PaletteItem } from '../exam-palette/exam-palette';
import { ExamHandoffService } from '../exam-state/exam-handoff.service';
import { ExamPlayStore } from '../exam-state/exam-play.store';
import { ExamTimer } from '../exam-timer/exam-timer';

const BN_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_LABELS = ['A', 'B', 'C', 'D'];

@Component({
  selector: 'app-exam-player-page',
  imports: [AppButton, AppConfirmDialog, AppEmptyState, ExamPalette, ExamTimer],
  providers: [ExamPlayStore],
  templateUrl: './exam-player-page.html',
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamPlayerPage implements ExamLeaveGuarded {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(ExamPlayStore);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);
  private readonly handoff = inject(ExamHandoffService);

  /** Non-null only when the config page just started THIS exam (fresh start). */
  private readonly justStartedId = this.handoff.consume();
  private resumeEmitted = false;

  /** Route param via component input binding. */
  readonly id = input.required<string>();

  private readonly paletteSheet =
    viewChild.required<ElementRef<HTMLDialogElement>>('paletteSheet');
  private readonly submitDlg =
    viewChild.required<AppConfirmDialog>('submitDlg');
  private readonly leaveDlg = viewChild.required<AppConfirmDialog>('leaveDlg');

  private leaveResolver: ((leave: boolean) => void) | null = null;

  protected readonly labels = computed(() =>
    this.store.current()?.language === 'EN' ? EN_LABELS : BN_LABELS,
  );

  protected readonly paletteItems = computed((): PaletteItem[] =>
    this.store.questions().map((q) => ({
      answered: q.selectedIndex !== null,
      flagged: q.flagged,
    })),
  );

  protected readonly submitMessage = computed(() => {
    const unanswered = this.store.total() - this.store.answeredCount();
    return unanswered > 0
      ? `${unanswered} ${this.i18n.t().exam.unansweredWarning}`
      : this.i18n.t().exam.allAnswered;
  });

  /** Announced politely to screen readers when the save status changes. */
  protected readonly saveAnnouncement = computed(() => {
    switch (this.store.saveState()) {
      case 'saving':
        return this.i18n.t().common.saving;
      case 'saved':
        return this.i18n.t().exam.saved;
      case 'error':
        return this.i18n.t().exam.saveErrorShort;
      default:
        return '';
    }
  });

  constructor() {
    this.store.load(this.id);

    effect(() => {
      if (this.store.finished()) {
        void this.router.navigate(['/exam', this.id(), 'result']);
      }
    });

    // An in-progress session reached without the fresh-start handoff means the
    // learner resumed after a reload/disconnect (or from history).
    effect(() => {
      if (this.resumeEmitted) return;
      if (this.store.status() === 'IN_PROGRESS') {
        this.resumeEmitted = true;
        if (this.justStartedId !== this.id()) {
          this.analytics.record({
            name: 'exam_resumed_after_disconnect',
            sessionId: this.id(),
          });
        }
      }
    });
  }

  // --- Leave protection (CanDeactivate + beforeunload) ---

  canLeave(): boolean {
    // Only guard an active attempt; submitting/expired flows may leave freely.
    return (
      this.store.finished() ||
      this.store.loadError() ||
      this.store.status() !== 'IN_PROGRESS'
    );
  }

  confirmLeave(): Promise<boolean> {
    this.leaveDlg().open();
    return new Promise<boolean>((resolve) => (this.leaveResolver = resolve));
  }

  protected onLeaveConfirmed(): void {
    this.resolveLeave(true);
  }

  protected onLeaveCancelled(): void {
    this.resolveLeave(false);
  }

  private resolveLeave(leave: boolean): void {
    this.leaveResolver?.(leave);
    this.leaveResolver = null;
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.canLeave()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  // --- Keyboard navigation ---

  protected onKeydown(event: KeyboardEvent): void {
    if (this.store.finished() || this.store.loading()) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    // Ignore while any dialog (submit/leave/palette sheet) is open.
    if (document.querySelector('dialog[open]')) return;
    const tag = (event.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    switch (event.key) {
      case 'ArrowLeft':
        this.store.prev();
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.store.next();
        event.preventDefault();
        break;
      case '1':
      case '2':
      case '3':
      case '4': {
        const index = Number(event.key) - 1;
        if (index < (this.store.current()?.options.length ?? 0)) {
          this.store.select(index);
          event.preventDefault();
        }
        break;
      }
      case 'f':
      case 'F':
        this.store.toggleFlag();
        event.preventDefault();
        break;
    }
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
