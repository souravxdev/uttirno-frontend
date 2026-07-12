import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export interface PaletteItem {
  answered: boolean;
  flagged: boolean;
}

/** Question number grid: answered = filled, current = ringed, flagged = corner dot. */
@Component({
  selector: 'app-exam-palette',
  templateUrl: './exam-palette.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamPalette {
  readonly items = input.required<PaletteItem[]>();
  readonly currentIndex = input.required<number>();
  readonly jump = output<number>();
}
