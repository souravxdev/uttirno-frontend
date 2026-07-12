import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppBadge, sessionStatusTone } from '../../../shared/ui/badge/badge';
import { AppButton } from '../../../shared/ui/button/button';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';
import { AppPagination } from '../../../shared/ui/pagination/pagination';
import { formatDateTime } from '../../../shared/util/format';
import { HistoryStore } from '../history-state/history.store';
import { ScoreSparkline } from '../score-sparkline/score-sparkline';

@Component({
  selector: 'app-history-page',
  imports: [
    RouterLink,
    AppBadge,
    AppButton,
    AppEmptyState,
    AppPageHeader,
    AppPagination,
    ScoreSparkline,
  ],
  templateUrl: './history-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(HistoryStore);

  protected readonly sessionStatusTone = sessionStatusTone;

  constructor() {
    this.store.load();
  }

  protected date(iso: string): string {
    return formatDateTime(iso, this.i18n.lang());
  }

  protected minutes(timeLimitSec: number): number {
    return Math.round(timeLimitSec / 60);
  }
}
