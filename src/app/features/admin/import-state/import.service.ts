import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api-base';
import type { Dto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly http = inject(HttpClient);

  uploadCsv(file: File): Observable<Dto<'ImportReportDto'>> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Dto<'ImportReportDto'>>(
      `${API_BASE_URL}/api/admin/import/csv`,
      form,
    );
  }

  generateDrafts(
    body: Dto<'AiDraftRequestDto'>,
  ): Observable<Dto<'AiDraftReportDto'>> {
    return this.http.post<Dto<'AiDraftReportDto'>>(
      `${API_BASE_URL}/api/admin/import/ai-drafts`,
      body,
    );
  }
}
