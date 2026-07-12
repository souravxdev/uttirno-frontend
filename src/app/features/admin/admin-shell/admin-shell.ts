import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';

type TabKey = 'questions' | 'review' | 'import';

const TABS: { path: string; key: TabKey }[] = [
  { path: 'questions', key: 'questions' },
  { path: 'review', key: 'review' },
  { path: 'import', key: 'import' },
];

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  protected readonly i18n = inject(LanguageStore);
  protected readonly tabs = TABS;

  protected label(key: TabKey): string {
    return this.i18n.t().nav[key];
  }
}
