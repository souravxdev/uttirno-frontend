import type { Dto } from '../api/api.types';

/** Rendered via i18n: t().auth[error] — keys, never raw messages. */
export type AuthErrorKey = 'invalidCredentials' | 'registerFailed';

/** Shape persisted to localStorage under 'uttirno.auth'. */
export interface StoredAuth {
  user: Dto<'UserDto'>;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: Dto<'UserDto'> | null;
  accessToken: string | null;
  refreshToken: string | null;
  pending: boolean;
  error: AuthErrorKey | null;
}
