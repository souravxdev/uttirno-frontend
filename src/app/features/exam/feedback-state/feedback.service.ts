import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api-base';
import type { Dto } from '../../../core/api/api.types';

/** POST /api/sessions/:id/feedback — learner rates a finished exam. */
@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);

  submit(
    sessionId: string,
    body: Dto<'SubmitFeedbackRequestDto'>,
  ): Observable<Dto<'FeedbackDto'>> {
    return this.http.post<Dto<'FeedbackDto'>>(
      `${API_BASE_URL}/api/sessions/${sessionId}/feedback`,
      body,
    );
  }
}
