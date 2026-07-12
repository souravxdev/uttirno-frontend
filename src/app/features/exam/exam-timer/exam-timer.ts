import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { formatClock } from '../../../shared/util/format';
import type { TimerTone } from '../exam-state/exam.models';

const TONE_CLASSES: Record<TimerTone, string> = {
  normal: 'bg-slate-100 text-slate-700',
  warn: 'bg-amber-100 text-amber-800',
  danger: 'animate-pulse bg-rose-100 text-rose-800',
};

@Component({
  selector: 'app-exam-timer',
  templateUrl: './exam-timer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamTimer {
  readonly remainingSec = input.required<number | null>();
  readonly tone = input<TimerTone>('normal');

  protected readonly toneClass = computed(() => TONE_CLASSES[this.tone()]);
  protected readonly clock = computed(() =>
    formatClock(this.remainingSec() ?? 0),
  );
}
