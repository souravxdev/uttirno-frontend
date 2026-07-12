import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api-base';
import type { AdminQuestionsQuery, Dto } from '../../../core/api/api.types';

const BASE = `${API_BASE_URL}/api/admin/questions`;

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private readonly http = inject(HttpClient);

  list(query: AdminQuestionsQuery): Observable<Dto<'AdminQuestionListDto'>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<Dto<'AdminQuestionListDto'>>(BASE, { params });
  }

  byId(id: string): Observable<Dto<'AdminQuestionDto'>> {
    return this.http.get<Dto<'AdminQuestionDto'>>(`${BASE}/${id}`);
  }

  create(
    body: Dto<'QuestionCreateRequestDto'>,
  ): Observable<Dto<'AdminQuestionDto'>> {
    return this.http.post<Dto<'AdminQuestionDto'>>(BASE, body);
  }

  update(
    id: string,
    body: Dto<'QuestionUpdateRequestDto'>,
  ): Observable<Dto<'AdminQuestionDto'>> {
    return this.http.patch<Dto<'AdminQuestionDto'>>(`${BASE}/${id}`, body);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  approve(id: string): Observable<Dto<'AdminQuestionDto'>> {
    return this.http.post<Dto<'AdminQuestionDto'>>(`${BASE}/${id}/approve`, {});
  }

  reject(id: string): Observable<Dto<'AdminQuestionDto'>> {
    return this.http.post<Dto<'AdminQuestionDto'>>(`${BASE}/${id}/reject`, {});
  }
}
