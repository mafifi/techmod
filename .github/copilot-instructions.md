## Quick context for AI coding agents

This repository (TechMod) is a SvelteKit frontend with a Convex backend and Cloudflare Workers deployment. Key areas:

- Frontend: `routes/`, Svelte components (e.g. `routes/+page.svelte`, `routes/+layout.svelte`).
- Convex backend functions: `src/convex/`
- Convex generated API `src/convex/_generated/` (do NOT edit generated files).
- Shared utilities: `src/lib/index.ts` and `src/lib/assets/`.
- Tests: unit tests with Vitest (`vitest`, `vitest-setup-client.ts`) and end-to-end tests with Playwright in `e2e/`.
- Deployment: SvelteKit uses a Cloudflare adapter and `wrangler.jsonc` is present for Cloudflare Workers.

## High-level architecture and data flow

- UI components in `routes/` call Convex client hooks (via `convex-svelte`) to read/write data.
- Convex functions live under `src/convex/` and expose server-side queries/mutations; generated client/server bindings are under `src/convex/_generated/`.
- The build output is a SvelteKit app targeted at Cloudflare Workers (adapter + `wrangler.jsonc`).

## Important files to reference

- `package.json` — scripts and devDependencies (dev: `vite`, `vitest`, `playwright`, `wrangler`).
- `src/convex/README.md` — Convex function examples and CLI hints (`npx convex -h`, `npx convex docs`).
- `src/convex/_generated/` — generated types and server/client bindings (do not modify).
- `playwright.config.ts`, `e2e/` — e2e configuration and tests.
- `vitest-setup-client.ts` and `demo.spec.ts` — unit-test setup examples for Svelte components.

## Concrete developer workflows (commands)

- Install: `npm install`
- Run local dev: `npm run dev` (uses Vite + SvelteKit)
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint & format: `npm run lint` and `npm run format`
- Typecheck: `npm run check` (uses `svelte-check` and `svelte-kit sync`)
- Unit tests: `npm run test:unit` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)

For Convex-specific actions: use the Convex CLI from the repo root, e.g. `npx convex -h` and `npx convex docs` as noted in `src/convex/README.md`.

## Project-specific conventions and gotchas

- Never edit files in `src/convex/_generated/` — they are produced by Convex tooling.
- Convex functions use the pattern shown in `src/convex/README.md`: import helpers from `./_generated/server` and validators from `convex/values`.
- The repo runs SvelteKit sync in `prepare` and `check` scripts: updates to route types or SvelteKit config may require running `npm run prepare` or `svelte-kit sync`.
- Tests: unit tests use Vitest with Svelte browser helpers (see `vitest-setup-client.ts`). E2E tests live under `e2e/` and rely on Playwright config in the root.
- Cloudflare deployment: adapter-cloudflare is installed and `wrangler.jsonc` config exists — check `wrangler.jsonc` before running a publish (typical commands: `wrangler login`, `wrangler publish`), but confirm account/config first.

### Convex + Zod validation (repository-specific)

- This project may follow the Convex TypeScript + Zod validation pattern (see https://stack.convex.dev/typescript-zod-function-validation). When using Zod:
  - Keep runtime Zod schemas colocated with Convex functions under `src/convex/` (for example `src/convex/schemas.ts`) and import the schema into the function file.
  - Export TypeScript types from the Zod schemas (`type Args = z.infer<typeof argsSchema>`) for use in client code, but never edit or add schemas inside `src/convex/_generated/`.
  - After changing exported types or route shapes, run `npm run prepare` / `svelte-kit sync` to refresh SvelteKit route types.
  - Prefer small, plain Zod schemas for Convex function args (validators on the server) rather than large cross-cutting runtime code — keep Convex functions simple and serializable.

## Examples to follow when changing code

- Adding a Convex query/mutation: create a file under `src/convex/` and export `query({...})` or `mutation({...})` per `src/convex/README.md`; use validators (v.number(), v.string(), etc.), and return plain JS objects or Convex values.
- Calling Convex from Svelte: use `convex-svelte` hooks (example pattern in `src/convex/README.md`):
  - `useQuery(api.myFunctions.myQueryFunction, { first: 10, second: 'hello' })`

## What to avoid

- Editing generated artifacts (`src/convex/_generated/*`).
- Assuming deployment details — always inspect `wrangler.jsonc` and `package.json` before publishing.

## Where to look when something is failing

- Build/type errors: run `npm run check` and examine `svelte-check` output and `tsconfig.json`.
- Unit tests: `npm run test:unit` (Vitest) — see `vitest-setup-client.ts` for environment setup.
- E2E: `npm run test:e2e` (Playwright) — check `playwright.config.ts` and `e2e/*.test.ts`.

---

If any of the above is unclear or you want more detail (deployment steps, Convex deployment targets, or test examples), tell me which section to expand and I will iterate.
