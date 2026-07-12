import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';
import { ExamConfigStore } from '../exam-state/exam-config.store';
import { ExamHandoffService } from '../exam-state/exam-handoff.service';
import { COUNT_PRESETS, DURATION_PRESETS } from '../exam-state/exam.models';

@Component({
  selector: 'app-exam-config-page',
  imports: [AppButton, AppPageHeader],
  providers: [ExamConfigStore],
  templateUrl: './exam-config-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamConfigPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(ExamConfigStore);
  protected readonly taxonomy = inject(TaxonomyStore);
  private readonly router = inject(Router);
  private readonly handoff = inject(ExamHandoffService);

  protected readonly COUNT_PRESETS = COUNT_PRESETS;
  protected readonly DURATION_PRESETS = DURATION_PRESETS;

  constructor() {
    this.taxonomy.loadOnce();

    // Session started → into the player. Mark the handoff so the player knows
    // this is a fresh start, not a resume-after-disconnect.
    effect(() => {
      const id = this.store.startedId();
      if (id) {
        this.handoff.markStarted(id);
        void this.router.navigate(['/exam', id]);
      }
    });

    // Keep the selected count preset inside the available pool.
    effect(() => {
      const available = this.store.availableCount();
      if (available > 0 && this.store.questionCount() > available) {
        const best =
          [...COUNT_PRESETS].reverse().find((p) => p <= available) ??
          COUNT_PRESETS[0];
        this.store.setCount(best);
      }
    });
  }
}
