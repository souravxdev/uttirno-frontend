import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth/auth-state/auth.store';
import { LanguageStore } from './core/i18n/i18n-state/language.store';
import { AppButton } from './shared/ui/button/button';
import { AppToastContainer } from './shared/ui/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AppButton, AppToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly i18n = inject(LanguageStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected async signOut(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
