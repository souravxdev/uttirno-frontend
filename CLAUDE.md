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
- Every component lives in its own dedicated folder holding the .ts and
  its .html template (templateUrl, never inline template strings), e.g.
  shared/ui/button/button.ts + button.html
- Types/interfaces live in grouped model files (e.g. ui.models.ts,
  auth.models.ts, api.types.ts) — never declared inside component files
- Data access pattern: HTTP calls live in @Injectable services; stores
  call services through rxMethod pipelines handling next/error/finalize
  (tap({next,error}) + catchError(() => EMPTY) + finalize); components
  trigger store methods and derive view data with computed()
- Each domain keeps its service + store + models together in a
  '<domain>-state' folder (e.g. core/auth/auth-state/,
  features/home/home-state/); routes always lazy-load
  (loadComponent/loadChildren)

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
