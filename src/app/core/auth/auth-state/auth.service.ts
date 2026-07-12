import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api/api-base';
import type { Dto } from '../../api/api.types';

/** All auth HTTP calls — stores never touch HttpClient directly. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(body: Dto<'LoginRequestDto'>): Observable<Dto<'AuthResponseDto'>> {
    return this.http.post<Dto<'AuthResponseDto'>>(
      `${API_BASE_URL}/api/auth/login`,
      body,
    );
  }

  register(
    body: Dto<'RegisterRequestDto'>,
  ): Observable<Dto<'AuthResponseDto'>> {
    return this.http.post<Dto<'AuthResponseDto'>>(
      `${API_BASE_URL}/api/auth/register`,
      body,
    );
  }

  refresh(body: Dto<'RefreshRequestDto'>): Observable<Dto<'AuthResponseDto'>> {
    return this.http.post<Dto<'AuthResponseDto'>>(
      `${API_BASE_URL}/api/auth/refresh`,
      body,
    );
  }
}
