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
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth-state/auth.store';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppField } from '../../../shared/ui/field/field';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, AppButton, AppField],
  templateUrl: './register-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

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
      ? this.i18n.t().auth.passwordMin
      : null;
  });

  constructor() {
    this.auth.clearError();
    effect(() => {
      if (this.auth.isLoggedIn()) void this.router.navigateByUrl('/');
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const { name, email, password } = this.form.getRawValue();
    this.auth.register({ email, password, name: name.trim() || undefined });
  }
}
