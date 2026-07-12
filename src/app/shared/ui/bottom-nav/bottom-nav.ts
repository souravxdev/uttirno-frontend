import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';

type NavKey = 'home' | 'browse' | 'exam' | 'history';

const ITEMS: { path: string; key: NavKey; exact: boolean }[] = [
  { path: '/', key: 'home', exact: true },
  { path: '/browse', key: 'browse', exact: false },
  { path: '/exam', key: 'exam', exact: false },
  { path: '/history', key: 'history', exact: false },
];

/** Mobile-only learner navigation (hidden on /admin and the exam player). */
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBottomNav {
  protected readonly i18n = inject(LanguageStore);
  protected readonly items = ITEMS;
}
