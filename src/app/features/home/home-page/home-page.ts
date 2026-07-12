import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth-state/auth.store';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppButton } from '../../../shared/ui/button/button';
import { HomeStore } from '../home-state/home.store';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AppButton],
  providers: [HomeStore],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly auth = inject(AuthStore);
  private readonly home = inject(HomeStore);

  protected readonly healthKind = computed(() => this.home.health().kind);
  protected readonly healthVersion = computed(() => {
    const health = this.home.health();
    return health.kind === 'up' ? health.version : '';
  });

  constructor() {
    this.home.loadHealth();
  }
}
