# Agent Reference: Small Web Apps

Quick reference for Claude and other agents working in this repository.

## Entry Point

**When you start**: Read in this order:
1. `.claude/INSTRUCTIONS.md` (5 min) — project structure & quick checklist
2. `../../CLAUDE.md` (10 min) — product definition & architecture
3. `../../apps/web/src/data/apps.ts` (3 min) — current tool inventory

**Then**: Use the validation skills before committing.

## Golden Rule

> Small Web Apps is optimized for:
> 1. **Indexable, useful content** (not deceptive or thin)
> 2. **AdSense-friendly** (no ads in tool workflow)
> 3. **Fast browser-first** tools (lazy-load heavy libs)
> 4. **Simple Cloudflare deployment** (build to dist/, push to origin/main)

## Common Tasks

### Add a New Tool
```
1. Add metadata to apps/web/src/data/apps.ts
   - Required: slug, title, description, tags, status, features, faqSchema
2. Create React component: apps/web/src/tools/[slug]/[Slug]App.tsx
3. Register in apps/web/src/components/tools/ToolMount.astro
4. Page auto-generates from apps/web/src/pages/apps/[slug].astro
5. Run: ./.claude/skills/build-validator.sh
6. Commit & push
```

### Fix a Bug
```
1. Locate the issue (tool, page, route, metadata)
2. Make minimal fix (don't refactor unrelated code)
3. Run: ./.claude/skills/build-validator.sh
4. Commit with clear message (what + why)
5. Push to origin/main
```

### Improve SEO/Metadata
```
1. Edit apps/web/src/data/apps.ts (title, description, faqSchema)
   OR apps/web/src/pages/guides/[slug].astro (article schema)
2. Run: ./.claude/skills/seo-checker.sh
3. Build to validate: pnpm --dir apps/web run build
4. Commit & push
```

### Deploy
```
**Only when explicitly requested.**
Cloudflare Pages auto-deploys from origin/main:
1. Merge/push to origin/main
2. Cloudflare Pages CI/CD triggers automatically
3. Deploys to https://smallwebapps.com
```

## Constraints (Hard Rules)

### ❌ Never
- Touch `apps/botschannel` — explicitly out of scope
- Ship thin pages (only widget, no content/FAQ)
- Place ads inside the tool workflow
- Deploy without explicit request
- Duplicate tool metadata (keep apps.ts canonical)
- Make breaking changes to URL structure

### ✅ Always
- Keep tool pages useful without JavaScript (H1, description, FAQ, links)
- Validate with build-validator.sh before committing
- Check SEO essentials with seo-checker.sh
- Centralize metadata in apps/web/src/data/apps.ts
- Lazy-load heavy libraries (PDF, image, compression)
- Test in browser if change is observable (UI, tool, metadata)

## File Map (Core Paths)

```
apps/web/
├── src/
│   ├── data/
│   │   ├── apps.ts          ← Tool metadata (canonical source)
│   │   └── guides.ts        ← Guide metadata
│   ├── pages/
│   │   ├── apps/[slug].astro    ← Tool page (auto-generated)
│   │   ├── guides/[slug].astro  ← Guide page with article schema
│   │   └── og/[slug].svg.ts     ← OG image endpoint
│   ├── tools/[slug]/        ← Tool implementations (React)
│   └── components/
│       ├── layout/MainLayout.astro  ← Global meta + structured data
│       └── tools/ToolMount.astro    ← Tool registration
├── public/
│   ├── _headers             ← Security headers (HSTS, CSP, etc.)
│   └── favicon/*            ← Favicons & manifest
└── dist/                    ← Build output (144 pages, ~1.3 MB)

.claude/
├── INSTRUCTIONS.md      ← Detailed agent guidance (READ THIS)
├── settings.json        ← Model, build commands, permissions
├── skills/              ← Validation scripts (build-validator, seo-checker)
├── hooks.json           ← Pre-commit/push automation
└── templates/           ← PR & issue templates

CLAUDE.md               ← Product definition & architecture (CANONICAL)
AGENTS.md               ← Redirects to CLAUDE.md
CODEX.md                ← Redirects to CLAUDE.md
```

## Before Every Commit

```bash
# 1. Validate build
./.claude/skills/build-validator.sh

# 2. Check SEO essentials
./.claude/skills/seo-checker.sh

# 3. Inspect git status
git status

# 4. Make sure only requested files changed
git diff --name-only

# 5. Commit
git commit -m "Clear message: what + why"

# 6. Push
git push origin main
```

## Models & Capabilities

- **No default model configured** — use what fits your task
- For **architecture & design decisions**: use a capable model (Opus for complex reasoning)
- For **simple code gen**: any model works fine
- **Settings don't lock you in** — choose per-task in Claude Code UI or via CLI

## Debugging & Validation

### Build fails
```bash
pnpm install --frozen-lockfile
pnpm --dir apps/web run build
# Check for missing dependencies or type errors
```

### Tool not showing up
```bash
# 1. Check apps.ts for metadata
grep -i "tool-slug" apps/web/src/data/apps.ts

# 2. Check ToolMount.astro for registration
grep -i "tool-slug" apps/web/src/components/tools/ToolMount.astro

# 3. Check if component exists
ls apps/web/src/tools/tool-slug/

# 4. Rebuild and check dist/apps/tool-slug/
pnpm --dir apps/web run build
```

### SEO not indexing
```bash
# Run SEO checker
./.claude/skills/seo-checker.sh

# Check robots.txt
cat apps/web/dist/robots.txt

# Check sitemap
cat apps/web/dist/sitemap-index.xml

# Check OG images are generating
ls apps/web/dist/og/*.svg | wc -l
```

## Links & References

- **Product docs**: `../../CLAUDE.md` (read completely before major changes)
- **Agent instructions**: `.claude/INSTRUCTIONS.md` (quick reference)
- **Build reference**: `../../apps/web/package.json` (scripts, dependencies)
- **SEO schema**: https://schema.org/SoftwareApplication (for tools), https://schema.org/Article (for guides)
- **Cloudflare Pages**: https://pages.cloudflare.com (deployment platform)
- **Astro docs**: https://docs.astro.build (routing, components, build)
- **React docs**: https://react.dev (tool implementation)

---

**This is a living reference.** If you find it out of date or unclear, update it and commit the fix.
