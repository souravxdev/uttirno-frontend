import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthStore } from './core/auth/auth-state/auth.store';
import { LanguageStore } from './core/i18n/i18n-state/language.store';
import { AppBottomNav } from './shared/ui/bottom-nav/bottom-nav';
import { AppButton } from './shared/ui/button/button';
import { AppToastContainer } from './shared/ui/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AppBottomNav, AppButton, AppToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly i18n = inject(LanguageStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Hidden on /admin/** and on the exam player (/exam/:id) only. */
  protected readonly showBottomNav = computed(() => {
    const path = this.url().split('?')[0];
    return !path.startsWith('/admin') && !/^\/exam\/[^/]+$/.test(path);
  });

  protected readonly mainClass = computed(
    () =>
      'mx-auto w-full max-w-6xl flex-1 px-4 pt-6 md:px-6 ' +
      (this.showBottomNav() ? 'pb-24 md:pb-6' : 'pb-6'),
  );

  protected async signOut(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
