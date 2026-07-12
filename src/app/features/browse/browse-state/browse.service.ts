import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api-base';
import type { Dto } from '../../../core/api/api.types';
import type { BrowseQuery } from './browse.models';

/** Public question bank (PUBLISHED only, no answers — server-enforced). */
@Injectable({ providedIn: 'root' })
export class BrowseService {
  private readonly http = inject(HttpClient);

  list(query: BrowseQuery): Observable<Dto<'PublicQuestionListDto'>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<Dto<'PublicQuestionListDto'>>(
      `${API_BASE_URL}/api/questions`,
      { params },
    );
  }
}
