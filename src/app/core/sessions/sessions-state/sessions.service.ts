import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api/api-base';
import type { Dto } from '../../api/api.types';

const BASE = `${API_BASE_URL}/api/sessions`;

/** All quiz-session HTTP calls — consumed by practice, exam and history. */
@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly http = inject(HttpClient);

  create(
    body: Dto<'CreateSessionRequestDto'>,
  ): Observable<Dto<'SessionSummaryDto'>> {
    return this.http.post<Dto<'SessionSummaryDto'>>(BASE, body);
  }

  start(id: string): Observable<Dto<'SessionPlayStateDto'>> {
    return this.http.post<Dto<'SessionPlayStateDto'>>(`${BASE}/${id}/start`, {});
  }

  play(id: string): Observable<Dto<'SessionPlayStateDto'>> {
    return this.http.get<Dto<'SessionPlayStateDto'>>(`${BASE}/${id}/play`);
  }

  saveAnswer(
    id: string,
    body: Dto<'SaveAnswerRequestDto'>,
  ): Observable<Dto<'SaveAnswerResponseDto'>> {
    return this.http.patch<Dto<'SaveAnswerResponseDto'>>(
      `${BASE}/${id}/answers`,
      body,
    );
  }

  submit(id: string): Observable<Dto<'SessionResultDto'>> {
    return this.http.post<Dto<'SessionResultDto'>>(`${BASE}/${id}/submit`, {});
  }

  result(id: string): Observable<Dto<'SessionResultDto'>> {
    return this.http.get<Dto<'SessionResultDto'>>(`${BASE}/${id}/result`);
  }

  history(
    page: number,
    pageSize: number,
  ): Observable<Dto<'SessionHistoryDto'>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<Dto<'SessionHistoryDto'>>(BASE, { params });
  }
}
