import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type {
  Dto,
  QuestionDifficulty,
  QuestionLanguage,
  QuestionSourceType,
  QuestionStatus,
} from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import { AppButton } from '../../../shared/ui/button/button';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { AppField } from '../../../shared/ui/field/field';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';
import { QuestionPreview } from '../question-preview/question-preview';
import { QuestionFormStore } from '../questions-state/question-form.store';
import type { QuestionPreviewVm } from '../questions-state/questions.models';

@Component({
  selector: 'app-question-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppButton,
    AppEmptyState,
    AppField,
    AppPageHeader,
    QuestionPreview,
  ],
  providers: [QuestionFormStore],
  templateUrl: './question-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionFormPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(QuestionFormStore);
  protected readonly taxonomy = inject(TaxonomyStore);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly editId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  protected readonly DIFFICULTIES: QuestionDifficulty[] = [
    'EASY',
    'MEDIUM',
    'HARD',
  ];
  protected readonly SOURCE_TYPES: QuestionSourceType[] = [
    'PAST_PAPER',
    'ORIGINAL',
    'AI_GENERATED',
  ];
  protected readonly LANGUAGES: QuestionLanguage[] = ['BN', 'EN'];
  protected readonly STATUSES: QuestionStatus[] = [
    'DRAFT',
    'IN_REVIEW',
    'PUBLISHED',
  ];

  protected readonly form = this.fb.group({
    subjectId: this.fb.control(''), // UI helper — narrows the topic select
    topicId: this.fb.control('', Validators.required),
    stem: this.fb.control('', Validators.required),
    options: this.fb.array(
      Array.from({ length: 4 }, () =>
        this.fb.control('', Validators.required),
      ),
    ),
    correctIndex: new FormControl<number | null>(null, Validators.required),
    explanation: this.fb.control('', Validators.required),
    difficulty: this.fb.control<QuestionDifficulty>('MEDIUM'),
    language: this.fb.control<QuestionLanguage>('BN'),
    sourceType: this.fb.control<QuestionSourceType>('ORIGINAL'),
    sourceYear: new FormControl<number | null>(
      { value: null, disabled: true },
      Validators.required,
    ),
    sourceExam: new FormControl(
      { value: '', disabled: true },
      { nonNullable: true, validators: [Validators.required] },
    ),
    status: this.fb.control<QuestionStatus>('DRAFT'),
  });

  protected get options(): FormArray<FormControl<string>> {
    return this.form.controls.options;
  }

  protected readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  private readonly status = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  protected readonly submitted = signal(false);
  protected readonly serverBanner = signal<string[]>([]);

  protected readonly isAi = computed(
    () => this.value().sourceType === 'AI_GENERATED',
  );
  protected readonly isPastPaper = computed(
    () => this.value().sourceType === 'PAST_PAPER',
  );

  protected readonly topics = computed(() => {
    const subjectId = this.value().subjectId;
    return subjectId ? this.taxonomy.topicsOf(subjectId) : [];
  });

  protected readonly preview = computed((): QuestionPreviewVm => {
    const v = this.value();
    return {
      stem: v.stem ?? '',
      options: (v.options ?? []).map((opt) => opt ?? ''),
      correctIndex: v.correctIndex ?? null,
      explanation: v.explanation ?? '',
      language: v.language ?? 'BN',
    };
  });

  constructor() {
    this.taxonomy.loadOnce();
    if (this.editId) this.store.load(this.editId);

    // PAST_PAPER provenance fields exist only when relevant (mirrors zod).
    this.form.controls.sourceType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((sourceType) => {
        const { sourceYear, sourceExam, status } = this.form.controls;
        if (sourceType === 'PAST_PAPER') {
          sourceYear.enable();
          sourceExam.enable();
        } else {
          sourceYear.reset(null);
          sourceExam.reset('');
          sourceYear.disable();
          sourceExam.disable();
        }
        // AI content can never be published directly — approve is the path.
        if (sourceType === 'AI_GENERATED' && status.value === 'PUBLISHED') {
          status.setValue('DRAFT');
        }
      });

    this.form.controls.subjectId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.topicId.setValue(''));

    // Edit mode: hydrate the form once the question arrives.
    effect(() => {
      const q = this.store.question();
      if (!q) return;
      this.form.patchValue(
        {
          subjectId: q.topic.subject.id,
          topicId: q.topic.id,
          stem: q.stem,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          language: q.language,
          sourceType: q.sourceType,
          status: q.status,
        },
        { emitEvent: false },
      );
      this.options.setValue(q.options, { emitEvent: false });
      if (q.sourceType === 'PAST_PAPER') {
        this.form.controls.sourceYear.enable({ emitEvent: false });
        this.form.controls.sourceExam.enable({ emitEvent: false });
        this.form.patchValue(
          { sourceYear: q.sourceYear, sourceExam: q.sourceExam ?? '' },
          { emitEvent: false },
        );
      }
      this.form.updateValueAndValidity(); // one emission → preview refresh
    });

    // Server zod issues → inline field errors (path like 'options.2').
    effect(() => {
      const issues = this.store.issues();
      const unmapped: string[] = [];
      for (const issue of issues) {
        const segments = issue.path.split('.');
        const control =
          segments[0] === 'options' && segments[1] !== undefined
            ? this.options.at(Number(segments[1]))
            : this.form.get(segments[0]);
        if (control) {
          control.setErrors({ server: issue.message });
        } else {
          unmapped.push(`${issue.path}: ${issue.message}`);
        }
      }
      this.serverBanner.set(unmapped);
    });

    // Saved → back to the list.
    effect(() => {
      if (this.store.saved()) {
        void this.router.navigate(['/admin/questions']);
      }
    });
  }

  protected errorFor(path: string): string | null {
    this.status(); // track validity/value changes
    const control = path.startsWith('options.')
      ? this.options.at(Number(path.split('.')[1]))
      : this.form.get(path);
    if (!control) return null;
    const serverMessage = control.errors?.['server'] as string | undefined;
    if (serverMessage) return serverMessage;
    if (!this.submitted()) return null;
    return control.invalid ? this.i18n.t().common.required : null;
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const body: Dto<'QuestionCreateRequestDto'> = {
      topicId: raw.topicId,
      stem: raw.stem.trim(),
      options: raw.options,
      correctIndex: raw.correctIndex!,
      explanation: raw.explanation.trim(),
      difficulty: raw.difficulty,
      language: raw.language,
      sourceType: raw.sourceType,
      status: raw.status,
      ...(raw.sourceType === 'PAST_PAPER'
        ? { sourceYear: raw.sourceYear!, sourceExam: raw.sourceExam.trim() }
        : {}),
    };
    this.store.save(
      this.editId ? { id: this.editId, body } : { id: null, body },
    );
  }

  protected optionLabel(index: number): string {
    return `${this.i18n.t().admin.form.option} ${index + 1}`;
  }
}
