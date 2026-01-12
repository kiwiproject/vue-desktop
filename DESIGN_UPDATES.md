# DESIGN updates — 2026-01-11

Summary of revisions applied after initial review of `DESIGN.md`:

- TypeScript & linting
  - Public APIs must avoid `any`; prefer `unknown` or concrete types.
  - Project enforces `typescript` strict mode and `@typescript-eslint` rules.

- Plugin contract
  - Define a minimal `Plugin` interface: `name: string; install(app: App, options?: unknown): void`.
  - Plugins must only use public APIs and cannot depend on core internals (see CHECKLIST.md).

- Tooling & CI
  - `semantic-release` configured to run on `main` via GitHub Actions; requires `NPM_TOKEN` secret.
  - Node 24+ required for builds; `.nvmrc` set to `24.12.0`.

- Examples & testing
  - `examples/demo` contains a minimal Vite demo app. Use this for manual QA and feature demos.
  - `vitest` used for unit tests; keep tests fast and focused on core logic.

- Documentation
  - Add `ROADMAP.md` for commit-by-commit implementation plan and progress tracking.
