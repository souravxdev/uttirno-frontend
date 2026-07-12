import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { paths } from './api/generated/schema';
import { API_BASE_URL } from './core/api/api-base';
import { LanguageStore } from './core/i18n/language.store';

type HealthResponse =
  paths['/api/health']['get']['responses']['200']['content']['application/json'];

type HealthState =
  | { kind: 'checking' }
  | { kind: 'up'; version: string }
  | { kind: 'down' };

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly i18n = inject(LanguageStore);

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
