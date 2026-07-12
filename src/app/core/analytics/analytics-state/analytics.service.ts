import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../api/api-base';
import type { Dto } from '../../api/api.types';

/**
 * Fire-and-forget analytics. Records client-observed events; failures are
 * swallowed so analytics can never disrupt the learner's flow.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  record(body: Dto<'RecordEventRequestDto'>): void {
    this.http.post(`${API_BASE_URL}/api/events`, body).subscribe({
      error: () => {
        /* intentionally ignored */
      },
    });
  }
}
