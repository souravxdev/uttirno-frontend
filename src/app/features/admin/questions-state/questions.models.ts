import type {
  Dto,
  QuestionDifficulty,
  QuestionLanguage,
  QuestionSourceType,
  QuestionStatus,
} from '../../../core/api/api.types';

/** UI filter state for the admin questions list (slug-based). */
export interface QuestionsFilters {
  status?: QuestionStatus;
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  sourceType?: QuestionSourceType;
  language?: QuestionLanguage;
}

/**
 * Backend ZodValidationPipe 400 payload. This is the error contract of
 * src/common/zod-validation.pipe.ts, not an OpenAPI DTO — `path` is a
 * dot-joined field path like 'stem' or 'options.2'.
 */
export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationErrorBody {
  message: string;
  errors: ValidationIssue[];
}

export function isValidationErrorBody(
  body: unknown,
): body is ValidationErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as ValidationErrorBody).errors)
  );
}

/** Input of QuestionFormStore.save — create when id is null, else update. */
export type QuestionSaveInput =
  | { id: null; body: Dto<'QuestionCreateRequestDto'> }
  | { id: string; body: Dto<'QuestionUpdateRequestDto'> };

/** What the live learner preview renders (derived from the form value). */
export interface QuestionPreviewVm {
  stem: string;
  options: string[];
  correctIndex: number | null;
  explanation: string;
  language: QuestionLanguage;
}
