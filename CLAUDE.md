# Small Web Apps repository instructions

This is the canonical instruction file for every coding agent working in this repository. `AGENTS.md` redirects here; do not create a separate `CODEX.md` instruction file.

## Product definition

Small Web Apps is a single-domain product hub for free browser-based utilities. Optimize the codebase for:

1. indexable, useful content;
2. AdSense-friendly information architecture;
3. fast browser-first tools;
4. simple Cloudflare deployment.

Use `smallwebapps.com` as the canonical production domain.

## Architecture

- `apps/web` is the Small Web Apps Astro site and primary product.
- Astro owns routing, SEO pages, metadata, and static content.
- React islands own interactive tool surfaces only.
- `/apps/[slug]` is the canonical URL for each tool.
- Keep shared app metadata centralized in `apps/web/src/data/apps.ts`.
- Keep shared product types in `packages/data/src`.
- Keep tool implementations under `apps/web/src/tools/{slug}`.
- Keep tool pages data-driven through `apps/web/src/pages/apps/[slug].astro` and `ToolLayout.astro`.
- Preserve `apps/tubetrace` as the imported TubeTrace source workspace when changing the embedded TubeTrace route.
- `apps/botschannel` is not part of this repository’s current Small Web Apps scope. Do not recreate, build, deploy, commit, or modify it unless the user explicitly changes scope.

## Tool page contract

Every `/apps/[slug]` page must remain useful if JavaScript fails. Include:

- one clear H1 or equivalent visible tool title;
- original descriptive content from metadata/content sections;
- visible privacy and trust copy;
- limitations or disclaimers where relevant;
- FAQ content matching any FAQ structured data;
- related internal links.

Do not ship thin pages containing only a widget. Keep claims truthful, especially for probabilistic tools and browser-only processing.

## Adding or changing tools

1. Add or update metadata in `apps/web/src/data/apps.ts`.
2. Add the React implementation under `apps/web/src/tools/{slug}` when interactive.
3. Register the tool in `apps/web/src/components/tools/ToolMount.astro`.
4. Keep status, implementation, FAQ, features, content, and SEO metadata aligned.
5. Use variants for long-tail SEO pages only when they reuse shared implementation instead of duplicating heavy logic.

## Design and performance

- Use existing CSS variables and global styles before adding one-off visual systems.
- Keep dark mode compatible with `[data-theme="dark"]`.
- Prefer static HTML and CSS for page structure; hydrate only the interactive tool surface.
- Avoid importing heavy libraries at page load when a user action can dynamically import them.
- Review large tool chunks. PDF, image, QR, barcode, chart, and compression libraries should be deferred when practical.

## SEO and content

- English-first for v1, without blocking future localization.
- Keep canonical URLs aligned with sitemap URLs.
- Maintain `robots.txt`, sitemap output, and a real noindex 404 page.
- Add explicit title and description metadata to indexable pages.
- Preserve valid structured data when visible content supports it.
- Keep internal links between home, app pages, guides, Privacy, Terms, and Contact.
- Use precise, non-hyped language.
- Do not invent tool counts, categories, capabilities, or availability.
- Probabilistic tools such as image-origin inspection require clear limitations.

## Monetization and trust

- Keep Privacy, Terms, Contact, cookie consent, and AdSense integration live.
- Do not place ads inside the core tool workflow.
- Avoid deceptive download buttons, exaggerated claims, or unfinished featured tools.
- If a workflow is local-only, distinguish local file selection from server upload.

## Validation

For `apps/web` changes, run:

```bash
pnpm --dir apps/web run build
```

Use the Claude Code validation skills before committing:

```bash
# Validate build integrity
./.claude/skills/build-validator.sh

# Validate SEO essentials
./.claude/skills/seo-checker.sh
```

Before committing:

- inspect `git status`;
- confirm only requested workspaces changed;
- run `git diff --check`;
- verify no generated secrets or local environment files are staged.

## Claude Code Configuration

The `.claude/` directory contains automated behaviors, skills, and templates:

- **`.claude/settings.json`**: Project model (Opus 4.8), permissions, build/preview commands
- **`.claude/INSTRUCTIONS.md`**: Detailed guidance for Claude agents working in this repo
- **`.claude/skills/`**: Executable validation scripts (build-validator, seo-checker)
- **`.claude/hooks.json`**: Pre-commit and pre-push hooks (disabled by default; enable via `/config`)
- **`.claude/templates/`**: PR and issue templates following Small Web Apps conventions

All agents should reference `.claude/INSTRUCTIONS.md` for quick context and validation workflow.

## Deployment

- Cloudflare Pages project: `smallwebapps`
- Production domain: `https://smallwebapps.com`
- Build command: `pnpm build`
- Output directory: `apps/web/dist`

Deploy only when explicitly requested. Do not deploy another workspace as part of a Small Web Apps task.
