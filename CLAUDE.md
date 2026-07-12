# Uttirno frontend — Angular 21

## Conventions (non-negotiable)
- @ngrx/signals signalStore exclusively; no NgRx classic, no
  services-with-subjects for state
- ChangeDetectionStrategy.OnPush everywhere
- Signal-based component APIs: input(), output(), model()
- Functional interceptors and guards only
- Modern control flow (@if/@for/@switch); never *ngIf/*ngFor
- inject() over constructor injection
- Standalone components only; zoneless change detection (no zone.js)

## API layer
- All API types live in src/app/api/generated/ — GENERATED, never edit
  by hand
- Regenerate via `pnpm api:generate` (reads
  ../uttirno-backend/openapi/openapi.json)
- If a type is missing, the fix is in uttirno-backend + contract sync,
  never a hand-written interface here

## Bilingual system UI
- System UI strings (nav, buttons, labels, errors) are bilingual bn/en,
  runtime-switchable via LanguageStore (src/app/core/i18n/)
- Every user-facing string goes in core/i18n/translations.ts — never
  hardcode text in templates
- Quiz CONTENT language is separate: tracked per question
  (Question.language), not switched by the UI toggle

## Dependencies
Do not add libraries beyond: Tailwind CSS (chosen over Angular Material),
@ngrx/signals, openapi-typescript. Ask before anything else.

## Bangla
Test all question-rendering UI with Bangla stems (Noto Sans Bengali).
Mixed Bangla/English/math content must not break layout.

## Git
Claude NEVER runs git operations (see root git-handoff skill): stop at
each committable portion, report changed files, suggest a conventional
commit message, and wait for the user to commit.
