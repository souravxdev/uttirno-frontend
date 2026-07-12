# uttirno-frontend

Angular 21 app for Uttirno — MCQ exam prep platform for Bangladeshi govt job
aspirants (POC: BCS Preliminary). Standalone components, zoneless, signalStore,
Tailwind CSS. System UI is bilingual (bn/en, runtime-switchable).

## Commands

```bash
pnpm install          # install dependencies
pnpm start            # dev server (http://localhost:4200)
pnpm build            # production build
pnpm lint             # eslint
pnpm test             # vitest unit tests
pnpm api:generate     # regenerate API types from ../uttirno-backend/openapi/openapi.json
```

## API contract

`src/app/api/generated/` is GENERATED from the backend OpenAPI spec — never
edit it by hand and never hand-write interfaces that mirror the backend. If a
type is missing, fix the backend contract first, then `pnpm api:generate`.

The dev shell expects the backend at `http://localhost:3000` (run
`pnpm start:dev` in `../uttirno-backend`).
