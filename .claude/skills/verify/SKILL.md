---
name: verify
description: Verify the frontend is healthy — build, lint, unit tests, and a
  dev-server smoke check against the running backend. Use after any frontend
  change, before handing off to the user for commit.
---
1. `pnpm build` — production build must succeed with no errors.
2. `pnpm lint` — zero errors.
3. `pnpm test` — vitest suite green.
4. If API types were touched: `pnpm api:generate` must produce no diff
   (a diff means the backend contract changed without a sync — run the
   api-contract-sync skill from the root repo first).
5. Start the backend, then `pnpm start` and open http://localhost:4200 —
   the shell must show the API status card as Connected, and the bn/en
   toggle must switch every visible string.
