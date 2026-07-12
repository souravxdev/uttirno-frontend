import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api/api-base';
import type { Dto } from '../../api/api.types';

@Injectable({ providedIn: 'root' })
export class TaxonomyService {
  private readonly http = inject(HttpClient);

  tree(): Observable<Dto<'ExamTreeDto'>[]> {
    return this.http.get<Dto<'ExamTreeDto'>[]>(
      `${API_BASE_URL}/api/taxonomy/tree`,
    );
  }
}
