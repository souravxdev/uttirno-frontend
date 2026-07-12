import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type {
  QuestionDifficulty,
  QuestionSourceType,
  QuestionStatus,
  SessionStatus,
} from '../../../core/api/api.types';
import type { BadgeTone } from '../ui.models';

const TONES: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  amber: 'bg-amber-100 text-amber-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  rose: 'bg-rose-100 text-rose-800',
  sky: 'bg-sky-100 text-sky-800',
  violet: 'bg-violet-100 text-violet-800',
  primary: 'bg-primary-100 text-primary-800',
};

export function statusTone(status: QuestionStatus): BadgeTone {
  return status === 'PUBLISHED'
    ? 'emerald'
    : status === 'IN_REVIEW'
      ? 'amber'
      : 'slate';
}

export function difficultyTone(difficulty: QuestionDifficulty): BadgeTone {
  return difficulty === 'EASY'
    ? 'emerald'
    : difficulty === 'MEDIUM'
      ? 'amber'
      : 'rose';
}

export function sourceTypeTone(sourceType: QuestionSourceType): BadgeTone {
  return sourceType === 'AI_GENERATED'
    ? 'violet'
    : sourceType === 'PAST_PAPER'
      ? 'sky'
      : 'slate';
}

export function sessionStatusTone(status: SessionStatus): BadgeTone {
  switch (status) {
    case 'SUBMITTED':
      return 'emerald';
    case 'IN_PROGRESS':
      return 'amber';
    case 'EXPIRED':
      return 'rose';
    default:
      return 'slate';
  }
}

@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBadge {
  readonly tone = input<BadgeTone>('slate');

  protected readonly classes = computed(
    () =>
      `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[this.tone()]}`,
  );
}
