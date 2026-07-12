import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth-state/auth.store';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppField } from '../../../shared/ui/field/field';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, AppButton, AppField],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly returnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl');

  private readonly status = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  private readonly submitted = signal(false);

  protected readonly emailError = computed(() => {
    this.status();
    if (!this.submitted()) return null;
    return this.form.controls.email.invalid
      ? this.i18n.t().auth.emailInvalid
      : null;
  });

  protected readonly passwordError = computed(() => {
    this.status();
    if (!this.submitted()) return null;
    return this.form.controls.password.invalid
      ? this.i18n.t().common.required
      : null;
  });

  constructor() {
    this.auth.clearError();
    // Covers both a fresh login and an already-signed-in visitor.
    effect(() => {
      if (!this.auth.isLoggedIn()) return;
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      void this.router.navigateByUrl(
        returnUrl?.startsWith('/') ? returnUrl : '/',
      );
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.auth.login(this.form.getRawValue());
  }
}
