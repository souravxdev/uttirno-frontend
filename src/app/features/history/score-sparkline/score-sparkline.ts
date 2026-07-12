import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import type { Dto } from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { sparklinePoints, toPolyline } from './sparkline.util';

const VIEW_W = 100;
const VIEW_H = 32;

/**
 * Score-over-time trend for the history page. Hand-rolled inline SVG (no chart
 * library). Renders nothing until there are at least two scored attempts.
 */
@Component({
  selector: 'app-score-sparkline',
  imports: [],
  templateUrl: './score-sparkline.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreSparkline {
  protected readonly i18n = inject(LanguageStore);

  /** Sessions newest-first (as the history list provides them). */
  readonly sessions = input.required<Dto<'SessionSummaryDto'>[]>();

  protected readonly viewBox = `0 0 ${VIEW_W} ${VIEW_H}`;

  /** Scored attempts, oldest→newest, normalised to score-per-question. */
  private readonly ratios = computed(() =>
    this.sessions()
      .filter((s) => s.score !== null && s.questionCount > 0)
      .slice()
      .reverse()
      .map((s) => (s.score as number) / s.questionCount),
  );

  protected readonly hasTrend = computed(() => this.ratios().length >= 2);

  protected readonly points = computed(() =>
    sparklinePoints(this.ratios(), VIEW_W, VIEW_H),
  );

  protected readonly polyline = computed(() => toPolyline(this.points()));

  protected readonly lastPoint = computed(
    () => this.points().at(-1) ?? { x: 0, y: 0 },
  );
}
