# Kiddu Sant Cugat - instructions for Claude Code

> After installing the product-engineering packs, apply the `agent-instructions` skill once;
> it will merge its router rows into this file. Keep the ATDD rules below.

## How we work: ATDD (acceptance first)
1. `features/*.feature` are the specification, owned by the product owner (Assel).
   **Never edit, delete, skip or weaken a scenario.** If one looks wrong or impossible, stop and say why.
2. Per scenario in the current milestone (tags: @mvp, @pilot, @phase2):
   a. `acceptance-steps` subagent: step definitions in `tests/steps/`; the scenario runs and FAILS for the right reason.
   b. `implementer` subagent: smallest change that makes it pass; unit tests (Vitest) land with the change.
   c. Coordinator re-runs the gate itself. "It says it passes" is a claim, not a result.
   d. Independent review: a FRESH session that never saw the build (`independent-review` skill), never a subagent of the builder.
3. Behaviour values (radius, limits, thresholds, models) come from `config/*.yaml`. Never hard-code them.
4. One scenario (or one small group) per branch/PR. The PR lists the scenarios it makes pass.
5. Every bug fix lands with a test that failed before the fix (run the failing half).

## What never delegates (the owner or coordinator does it)
Deciding scope; accepting/rejecting review findings; deploys, promotions, database migrations, secrets; final verification; saying a milestone is done.

## Stack (matches the app-stack skills)
- Next.js (App Router) + TypeScript, MapLibre GL, Tailwind; deployed on Netlify (EU).
- Supabase (Postgres + PostGIS, EU region): items, sources, plans, RSVPs, review queue, class groups.
- Editor/AFA sign-in only (no family accounts in MVP): Supabase Auth magic link, or Clerk if the app-stack defaults are adopted.
- Tests: Playwright + playwright-bdd (Gherkin) on a phone profile; Vitest. Run Playwright with `--trace off` unless debugging.
- Pipeline: `pipeline/` in TypeScript, Anthropic SDK, zod, structured outputs, Message Batches API.

## Commands
`npm run dev` · `npm run test` · `npm run test:acceptance` · `npm run gate` (typecheck + test + acceptance) · `npm run pipeline:dry-run`

## Rules
- No child data, no tracking cookies, no storing visitor location (features/08).
- AI output is never published without schema validation and the editor rules (features/07, 11).
- Models come from `config/site.yaml`; use the cheapest that passes the golden set.
