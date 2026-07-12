import type { paths } from '../../api/generated/schema';

export type HealthResponse =
  paths['/api/health']['get']['responses']['200']['content']['application/json'];

export type HealthState =
  | { kind: 'checking' }
  | { kind: 'up'; version: string }
  | { kind: 'down' };
