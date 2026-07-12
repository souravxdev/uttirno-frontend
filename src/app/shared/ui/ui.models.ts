/** Models shared by the UI primitives in shared/ui. */

export type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type BtnSize = 'sm' | 'md';

export type BadgeTone =
  | 'slate'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'sky'
  | 'violet'
  | 'primary';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}
