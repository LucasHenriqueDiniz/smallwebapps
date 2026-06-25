# Small Web Apps

Small Web Apps is a single-domain product hub for lightweight browser-based tools. The site is designed to be fast, indexable, AdSense-ready, and easy to extend with both content pages and embedded interactive apps.

## Product model

- `smallwebapps.com` is the canonical site and deploy target for v1.
- `/apps/[slug]` is the canonical page for every app.
- Apps are embedded by default and run inside the hub when they are ready.
- External repos or subdomains are deferred until an app becomes too large or unrelated for the main codebase.

## Repository layout

```text
apps/
  web/                  Astro site shell, SEO pages, and embedded tools
  tubetrace/            Imported Vite + React TubeTrace app source
packages/
  config/               Shared config guidance and base TypeScript settings
  data/                 Shared product data types for app metadata
```

## Stack

- Astro
- TypeScript
- Tailwind CSS
- React islands for embedded tools
- Static-first build for Cloudflare deployment

## Getting started

1. Install `pnpm`.
2. Install dependencies:

```bash
pnpm install
```

3. Start the local dev server:

```bash
pnpm dev
```

4. Build the site:

```bash
pnpm build
```

## Adding a new app

1. Add app metadata in [apps.ts](./apps/web/src/data/apps.ts).
2. If the app is interactive, add its implementation under `apps/web/src/tools/{slug}`.
3. If the app is content-only for now, keep `implemented: false` and provide strong landing-page copy anyway.
4. Confirm the app page includes:
   - original descriptive content
   - privacy/trust copy
   - FAQ entries
   - related internal links
   - no manual ad slots inside the tool or article body

## Deployment

The initial deployment target is a single Cloudflare Pages project for the Astro site.

- Production domain: `https://smallwebapps.com`
- Preview domains: standard Cloudflare Pages preview URLs
- Output mode: static
- Repository: `https://github.com/LucasHenriqueDiniz/smallwebapps`

Cloudflare Pages build settings:

- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `apps/web/dist`

## App routing model

- `/apps/tubetrace` includes both the SEO landing content and the embedded TubeTrace UI.
- `/apps/json-formatter`, `/apps/ai-image-checker`, and `/apps/csv-cleaner` follow the same model.
- Guide content should reinforce app pages and the internal link graph.

## TubeTrace import status

The original TubeTrace codebase has been copied into `apps/tubetrace` so it now lives inside this monorepo.

- Current hub route: `/apps/tubetrace` in `apps/web`
- Imported source app: `apps/tubetrace`
- Current state: source preserved in-monorepo and embedded into the hub through a generated static bundle at `/tubetrace-app/`

## Embedding TubeTrace in the hub

The route `/apps/tubetrace` uses the original Vite app layout via an embedded static build.

- Sync command:

```bash
pnpm sync:tubetrace
```

- This builds `apps/tubetrace` with `BASE_PATH=/tubetrace-app/`
- Then copies the generated output into `apps/web/public/tubetrace-app`
- It also writes stable `embed.js` and `embed.css` files for native mounting inside the Astro route

## Agent files

- `AGENTS.md` contains the shared source of truth for architecture and content rules.
- `CODEX.md` contains Codex-oriented execution guidance.
- `CLAUDE.md` contains Claude-oriented planning and editing guidance.
