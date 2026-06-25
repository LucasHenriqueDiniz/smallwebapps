# .claude Directory

Claude Code project-specific configuration and automation for **Small Web Apps**.

## Files & Purpose

### `settings.json`
Project-level settings for Claude Code:
- **Model**: No default — choose per-task (flexible)
- **Permissions**: Git, bash, pnpm, node, npm
- **Build command**: `pnpm --dir apps/web run build`
- **Output**: `apps/web/dist`

To enable/disable hooks or change settings, run:
```bash
claude /config
```

### `INSTRUCTIONS.md`
**START HERE** — Quick reference for Claude agents:
- Project structure
- Before-commit checklist
- Key constraints (no botschannel, centralized metadata)
- Skill usage (build-validator, seo-checker)
- Adding new tools
- Deployment details

Read this before reading CLAUDE.md for agent onboarding.

### `skills/`
Executable shell scripts for validation:

#### `build-validator.sh`
Runs the build and validates:
- `apps/web/dist` directory exists
- 144 pages generated
- Critical files present (robots.txt, sitemap, agent-index.json)

Usage:
```bash
./.claude/skills/build-validator.sh
```

#### `seo-adsense-validator.sh`
Comprehensive SEO + AdSense validator:
- **AdSense**: ads.txt, AdSenseHead component, env var config
- **Consent Mode v2**: Privacy-first defaults, persistence
- **Security Headers**: CSP compatibility with AdSense/Fonts
- **Dark Mode**: Theme implementation
- **SEO**: robots.txt, sitemap, agent discovery
- **Metadata**: OG tags, Twitter Cards, structured data (JSON-LD, Schema.org)

Usage:
```bash
./.claude/skills/seo-adsense-validator.sh
```

Output: Detailed checklist (✓ pass, ⚠ warn, ✗ fail)

### `hooks.json`
Pre-commit and pre-push automation (disabled by default):
- `onBeforeCommit`: Type-check validation
- `onPushRemote`: Build validation before push

Enable selectively via `/config` if you want automation.

### `templates/`
GitHub templates for consistency:

#### `PULL_REQUEST.md`
Standard PR template enforcing:
- Type of change (new tool, bug, perf, etc.)
- Validation checklist (build passes, seo-checker, no botschannel)
- Testing notes

#### `ISSUE.md`
Issue template for:
- Bugs, feature requests, SEO issues
- Steps to reproduce
- Context (browser, tool, related issues)

## Quick Start for Agents

1. **Read** `INSTRUCTIONS.md` (2 min overview)
2. **Then read** `../../CLAUDE.md` (product & architecture)
3. **Before commit**, run:
   ```bash
   ./.claude/skills/build-validator.sh
   ./.claude/skills/seo-checker.sh
   ```
4. **When creating PR**, use the template: `.claude/templates/PULL_REQUEST.md`

## Key Constraints (TL;DR)

- ✅ Add tools to `apps.ts`, implement in `apps/web/src/tools/[slug]`
- ✅ Run build-validator + seo-checker before committing
- ❌ Never touch `apps/botschannel`
- ❌ Don't build/deploy outside explicit requests
- ✅ Keep tool metadata centralized
- ✅ Every tool page must be useful without JavaScript

## Links

- **Product definition**: `../../CLAUDE.md`
- **Agent guidance**: `.claude/INSTRUCTIONS.md`
- **App metadata**: `../../apps/web/src/data/apps.ts`
- **Tool page layout**: `../../apps/web/src/pages/apps/[slug].astro`
- **Deployment**: Cloudflare Pages (`smallwebapps` project)
