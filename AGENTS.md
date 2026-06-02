# AGENTS

## Project definition

Small Web Apps is a product hub, not a personal portfolio. The codebase should optimize for:

1. indexable content
2. AdSense-friendly information architecture
3. fast browser-first tools
4. simple Cloudflare deployment

## Core architecture rules

- Use `smallwebapps.com` as the only canonical domain in v1.
- Treat `/apps/[slug]` as the canonical page for discovery, SEO, and tool usage.
- Embed first-party tools by default inside the main site.
- Defer external repos or subdomains unless an app becomes too large or unrelated.
- Keep the site static-first; add runtime complexity only when justified.
- TubeTrace source also exists as a workspace app in `apps/tubetrace`; preserve that source when evolving the embedded route.

## Content and monetization rules

- Never ship thin app pages.
- Every app page must contain original explanatory content before or around the tool.
- Keep Privacy, Terms, and Contact pages live from the beginning.
- Preserve strong internal linking between home, app pages, and guides.
- Ad slots must not block the primary tool workflow.
- Use disclaimers for probabilistic or uncertain tools such as AI image inspection.

## Implementation rules

- Astro owns SEO pages and overall routing.
- React islands own interactive tool surfaces only.
- Keep app metadata centralized in `apps/web/src/data/apps.ts`.
- Prefer reusable section components over duplicating page structure.
- English-first for v1; keep future localization possible without structural rewrites.

## Tool page contract

Each `/apps/[slug]` page should include, in some form:

- hero
- clear description
- CTA or quick start
- AdSlot placeholder
- tool UI when implemented
- privacy/trust copy
- FAQ
- related apps or related guides

The page must still make sense if the interactive tool fails to hydrate.
