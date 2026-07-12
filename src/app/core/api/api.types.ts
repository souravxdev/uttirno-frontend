import type { components, paths } from '../../api/generated/schema';

/**
 * Named backend DTO, straight off the generated OpenAPI schema.
 * The single way API shapes enter application code — never hand-write
 * an interface that mirrors a backend type.
 */
export type Dto<K extends keyof components['schemas']> =
  components['schemas'][K];

/** Query params accepted by GET /api/admin/questions. */
export type AdminQuestionsQuery = NonNullable<
  paths['/api/admin/questions']['get']['parameters']['query']
>;

/* Contract-derived enum aliases — reuse instead of re-declaring unions. */
export type QuestionStatus = Dto<'AdminQuestionDto'>['status'];
export type QuestionDifficulty = Dto<'AdminQuestionDto'>['difficulty'];
export type QuestionSourceType = Dto<'AdminQuestionDto'>['sourceType'];
export type QuestionLanguage = Dto<'AdminQuestionDto'>['language'];
