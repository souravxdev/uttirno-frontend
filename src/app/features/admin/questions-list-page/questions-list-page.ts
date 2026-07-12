import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type {
  Dto,
  QuestionDifficulty,
  QuestionLanguage,
  QuestionSourceType,
  QuestionStatus,
} from '../../../core/api/api.types';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { TaxonomyStore } from '../../../core/taxonomy/taxonomy-state/taxonomy.store';
import {
  difficultyTone,
  sourceTypeTone,
  statusTone,
  AppBadge,
} from '../../../shared/ui/badge/badge';
import { AppButton } from '../../../shared/ui/button/button';
import { AppConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { AppEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { AppPageHeader } from '../../../shared/ui/page-header/page-header';
import { AppPagination } from '../../../shared/ui/pagination/pagination';
import { AdminQuestionsStore } from '../questions-state/admin-questions.store';
import type { QuestionsFilters } from '../questions-state/questions.models';

@Component({
  selector: 'app-questions-list-page',
  imports: [
    RouterLink,
    AppBadge,
    AppButton,
    AppConfirmDialog,
    AppEmptyState,
    AppPageHeader,
    AppPagination,
  ],
  templateUrl: './questions-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsListPage {
  protected readonly i18n = inject(LanguageStore);
  protected readonly store = inject(AdminQuestionsStore);
  protected readonly taxonomy = inject(TaxonomyStore);

  protected readonly STATUSES: QuestionStatus[] = [
    'DRAFT',
    'IN_REVIEW',
    'PUBLISHED',
  ];
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

  protected readonly statusTone = statusTone;
  protected readonly difficultyTone = difficultyTone;
  protected readonly sourceTypeTone = sourceTypeTone;

  protected readonly filtersOpen = signal(false);
  protected readonly deleteTarget = signal<Dto<'AdminQuestionDto'> | null>(
    null,
  );
  private readonly dlg = viewChild.required(AppConfirmDialog);

  protected readonly filterTopics = computed(() => {
    const subjectSlug = this.store.filters().subject;
    return subjectSlug ? this.taxonomy.topicsOf(subjectSlug) : [];
  });

  protected readonly filtersClass = computed(() =>
    this.filtersOpen()
      ? 'mt-3 grid gap-3 md:mt-0 md:flex md:flex-wrap md:items-end md:gap-2'
      : 'hidden md:flex md:flex-wrap md:items-end md:gap-2',
  );

  constructor() {
    this.taxonomy.loadOnce();
    this.store.load();
  }

  protected onFilter(key: keyof QuestionsFilters, event: Event): void {
    const value = (event.target as HTMLSelectElement).value || undefined;
    const patch: Partial<QuestionsFilters> = { [key]: value };
    if (key === 'subject') patch.topic = undefined;
    this.store.setFilters(patch);
  }

  protected askDelete(question: Dto<'AdminQuestionDto'>): void {
    this.deleteTarget.set(question);
    this.dlg().open();
  }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (target) this.store.remove(target.id);
  }
}
