# Claude Code Instructions for Small Web Apps

This file defines the automated behaviors and standards for Claude when working in this project.

## Quick Start

1. **Always read** `../../CLAUDE.md` first — it's the canonical source for product definition and architecture
2. **Validate with skills** before committing:
   - `.claude/skills/build-validator.sh` — ensures build completes and critical files exist
   - `.claude/skills/seo-checker.sh` — validates robots.txt, sitemap, metadata
3. **Use this model**: Claude Opus 4.8 (configured in settings.json)

## Project Structure

```
apps/web/                    # Astro site (main product)
├── src/
│   ├── components/          # Astro + React components
│   ├── pages/               # Astro routes (apps, guides, home)
│   ├── tools/               # React tool implementations
│   ├── data/                # Centralized metadata (apps.ts, guides.ts)
│   └── content/             # Markdown guides
├── dist/                    # Build output (144 pages, 1.3 MB min)
└── package.json

packages/data/src/          # Shared types (not actively used yet)
```

## Before Every Commit

```bash
# Validate build
./.claude/skills/build-validator.sh

# Check SEO essentials
./.claude/skills/seo-checker.sh

# Then commit
git add [files]
git commit -m "..."
```

## Key Constraints

- **No botschannel**: Explicitly out of scope. Do not recreate, build, or deploy it.
- **Keep tool metadata centralized** in `apps/web/src/data/apps.ts` — don't duplicate tool info.
- **Preserve tool page contract**: Every `/apps/[slug]` must be useful without JS (H1, descriptive content, FAQ, links, privacy/trust copy).
- **AdSense + Google Fonts compatible**: CSP and security headers in `apps/web/public/_headers` must allow these.
- **Build must output to `apps/web/dist`** for Cloudflare Pages deployment.

## Adding a New Tool

1. Add metadata to `apps/web/src/data/apps.ts` (required fields: slug, title, description, tags, status, features, faqSchema)
2. Implement React component in `apps/web/src/tools/[slug]/[Slug]App.tsx`
3. Register in `apps/web/src/components/tools/ToolMount.astro`
4. Add route in `apps/web/src/pages/apps/[slug].astro` (auto-generated from metadata)
5. Verify with build validator

## Deployment

- **Production domain**: `smallwebapps.com` (Cloudflare Pages)
- **Build command**: `pnpm build` (triggers `apps/web` build)
- **Output**: `apps/web/dist`
- **Deploy only when explicitly requested** — do not auto-deploy during normal development

## Agent Guidance

When Claude agents work in this repo:

1. **Respect the product definition** in CLAUDE.md — optimize for indexable content, AdSense, fast tools, simple deployment
2. **Validate before shipping** — run build-validator and seo-checker
3. **Reuse existing patterns** — check apps.ts metadata, ToolMount.astro registration, and [slug].astro page layout before inventing new systems
4. **Keep scope tight** — a tool addition doesn't require refactoring unrelated systems; three similar lines beat a premature abstraction
5. **Test in browser** if the change is observable (UI, tool flow, metadata) — don't rely on tests alone
6. **No botschannel** — period

## Skills & Automation

- **build-validator.sh**: Runs `pnpm --dir apps/web run build`, checks dist/ structure, validates critical files
- **seo-checker.sh**: Validates robots.txt, sitemap, app metadata, and guide schema
- Both are shell scripts; integrate via hooks if you want pre-commit validation

## Links

- Product docs: `../../CLAUDE.md`
- Agent discovery: `apps/web/src/pages/.well-known/agent-index.json.ts`
- Sitemap: `apps/web/dist/sitemap-index.xml` (generated)
- App metadata: `apps/web/src/data/apps.ts`
