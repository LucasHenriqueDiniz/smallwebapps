# CODEX

Read `AGENTS.md` first. This file adds Codex-specific execution guidance.

## Context order

1. `AGENTS.md` is the shared source of truth for architecture, design rules,
   privacy, SEO, monetization, and tool conventions.
2. `CLAUDE.md` contains extra repository-specific planning notes. Use it as
   secondary context when it does not conflict with `AGENTS.md`.
3. `.claude/launch.json` documents the existing local app launch target. The
   Codex action config in `.codex/environments/environment.toml` mirrors that
   same web dev loop.
4. Prefer package scripts from the root `package.json` over ad hoc commands.

## Working style

- Default to implementing within the current monorepo instead of suggesting external repos.
- Preserve the single-domain model unless the user explicitly requests otherwise.
- When adding a tool, update both the metadata and the route implementation in the same change.
- Keep copy practical, specific, and indexable.

## Repository conventions

- Site app: `apps/web`
- Imported TubeTrace source: `apps/tubetrace`
- Tool implementations: `apps/web/src/tools/{slug}`
- Shared app metadata: `apps/web/src/data/apps.ts`
- Shared product types: `packages/data/src`

## SEO and AdSense guardrails

- Do not create empty landing pages with a lone button or widget.
- Keep static copy visible before the interactive surface on tool pages.
- Preserve stable ad placeholder dimensions.
- Avoid exaggerated claims, especially on AI-related tools.

## Delivery expectations

- Prefer reusable page sections and data-driven rendering.
- Keep Tailwind usage consistent with the existing design tokens in global styles.
- If a page needs metadata, define it explicitly.
- Use the Codex `Run` action for the local Astro dev server when working in the
  desktop app. Use `Build`, `Check`, and `Preview` actions for quick validation
  before handing work back.
