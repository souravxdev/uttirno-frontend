import type { QuestionLanguage } from '../../core/api/api.types';

/**
 * What the learner review renderer needs. SessionResultItemDto is a
 * structural superset — result items pass in directly.
 */
export interface QuestionReviewVm {
  stem: string;
  options: string[];
  language: QuestionLanguage;
  selectedIndex: number | null;
  correctIndex: number;
  explanation: string;
}

export type ReviewOutcome = 'correct' | 'wrong' | 'skipped';
