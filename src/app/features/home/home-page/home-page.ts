import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api-base';
import { AuthStore } from '../../../core/auth/auth.store';
import { LanguageStore } from '../../../core/i18n/language.store';
import { AppButton } from '../../../shared/ui/button/button';
import type { HealthResponse, HealthState } from '../home.models';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AppButton],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly auth = inject(AuthStore);

  private readonly healthState = toSignal(
    inject(HttpClient)
      .get<HealthResponse>(`${API_BASE_URL}/api/health`)
      .pipe(
        map((res): HealthState => ({ kind: 'up', version: res.version })),
        catchError(() => of<HealthState>({ kind: 'down' })),
      ),
    { initialValue: { kind: 'checking' } as HealthState },
  );

  protected readonly healthKind = computed(() => this.healthState().kind);
  protected readonly healthVersion = computed(() => {
    const state = this.healthState();
    return state.kind === 'up' ? state.version : '';
  });
}
