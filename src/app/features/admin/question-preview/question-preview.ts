import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import type { QuestionPreviewVm } from '../questions-state/questions.models';

const BN_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const EN_LABELS = ['A', 'B', 'C', 'D'];

/** Renders the form value exactly as a learner would see the question. */
@Component({
  selector: 'app-question-preview',
  templateUrl: './question-preview.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionPreview {
  protected readonly i18n = inject(LanguageStore);

  readonly question = input.required<QuestionPreviewVm>();
  /** false = bare content (no card frame / preview caption), e.g. inside review cards. */
  readonly framed = input(true);

  protected readonly labels = computed(() =>
    this.question().language === 'BN' ? BN_LABELS : EN_LABELS,
  );
}
