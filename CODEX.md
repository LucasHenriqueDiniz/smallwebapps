# CODEX

Read `AGENTS.md` first. This file adds Codex-specific execution guidance.

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
