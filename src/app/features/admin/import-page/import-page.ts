import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import type {
  QuestionDifficulty,
  QuestionLanguage,
} from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppField } from '../../../shared/ui/field/field';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';
import { ToastStore } from '../../../shared/ui/toast-state/toast.store';
import {
  CSV_EXAMPLE_ROW,
  CSV_HEADER,
  CSV_MAX_BYTES,
} from '../import-state/import.models';
import { ImportStore } from '../import-state/import.store';

@Component({
  selector: 'app-import-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppButton,
    AppField,
    AppPageHeader,
  ],
  providers: [ImportStore],
  templateUrl: './import-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(ImportStore);
  protected readonly taxonomy = inject(TaxonomyStore);
  private readonly toast = inject(ToastStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly CSV_HEADER = CSV_HEADER;
  protected readonly CSV_EXAMPLE_ROW = CSV_EXAMPLE_ROW;
  protected readonly COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  protected readonly DIFFICULTIES: QuestionDifficulty[] = [
    'EASY',
    'MEDIUM',
    'HARD',
  ];
  protected readonly LANGUAGES: QuestionLanguage[] = ['BN', 'EN'];

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly aiSubmitted = signal(false);

  protected readonly aiForm = this.fb.group({
    subjectId: this.fb.control(''),
    topicId: this.fb.control('', Validators.required),
    count: this.fb.control(5),
    difficulty: this.fb.control<QuestionDifficulty>('MEDIUM'),
    language: this.fb.control<QuestionLanguage>('BN'),
  });

  private readonly aiValue = toSignal(this.aiForm.valueChanges, {
    initialValue: this.aiForm.value,
  });

  protected readonly aiTopics = computed(() => {
    const subjectId = this.aiValue().subjectId;
    return subjectId ? this.taxonomy.topicsOf(subjectId) : [];
  });

  protected readonly topicError = computed(() => {
    this.aiValue();
    if (!this.aiSubmitted()) return null;
    return this.aiForm.controls.topicId.invalid
      ? this.i18n.t().common.required
      : null;
  });

  constructor() {
    this.taxonomy.loadOnce();
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && file.size > CSV_MAX_BYTES) {
      this.toast.error(this.i18n.t().admin.import.tooLarge);
      input.value = '';
      this.selectedFile.set(null);
      return;
    }
    this.selectedFile.set(file);
  }

  protected upload(): void {
    const file = this.selectedFile();
    if (file) this.store.uploadCsv(file);
  }

  protected copyHeader(): void {
    void navigator.clipboard.writeText(
      `${CSV_HEADER}\n${CSV_EXAMPLE_ROW}`,
    );
    this.toast.success(this.i18n.t().common.copied);
  }

  protected generate(): void {
    this.aiSubmitted.set(true);
    if (this.aiForm.invalid) return;
    const { topicId, count, difficulty, language } = this.aiForm.getRawValue();
    this.store.generateDrafts({ topicId, count, difficulty, language });
  }
}
