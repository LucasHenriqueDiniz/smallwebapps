# CLAUDE

Read `AGENTS.md` first — it has the full architecture, data contracts, design system, and rules.

This file adds Claude-specific collaboration guidance on top.

---

## How I should approach tasks here

### Adding a new tool

1. Add entry to `apps/web/src/data/apps.ts` — this is the single source of truth
2. Create the React component at `apps/web/src/tools/[slug]/[SlugApp].tsx`
3. Register in `ToolMount.astro`
4. Optionally add to the header mega-menu in `Header.astro`
5. The `/apps/[slug]` page generates automatically — do not create a custom page file unless the tool needs a non-standard layout

### Modifying the visual design

- Always use CSS vars (`--text`, `--bg`, `--border`, etc.) — never hardcode hex in `.astro` component styles
- When writing CSS that needs to target a dark-mode ancestor, use `:global([data-theme="dark"])` in Astro scoped styles
- When writing CSS for dynamically injected HTML (e.g. `innerHTML` in scripts), use `:global(.class-name)` to escape Astro scoping
- The dark mode is CSS-variable based — `[data-theme="dark"]` is set on `<html>` before first paint

### Tool components (React)

- React tools use Tailwind — dark mode is handled by global CSS overrides in `global.css`, not by Tailwind's dark: prefix
- If a tool has colored elements that need dark mode, check if the class is already covered in `global.css`. If not, add an override there
- Keep tool components stateless where possible; local `useState` is fine, avoid global stores

---

## Architecture constraints

- **Single domain**: everything on `smallwebapps.com`. No subdomains for tools unless a tool is a completely separate product
- **Static first**: Astro generates static HTML. Only add client-side JS when the tool needs it
- **ToolLayout for tools, MainLayout for everything else**: don't use MainLayout for tool pages — it adds hero sections and extra chrome that tool users don't need
- **`apps.ts` is canonical**: if you want to add, rename, or deprecate a tool, always start there

---

## What NOT to do

- Don't add CMS or database calls — everything is static or client-side
- Don't add authentication — tools are anonymous by design
- Don't create separate page files for tools that already have entries in `apps.ts`
- Don't add `min-height` or `height` constraints to text containers where the height should be determined by the font size and padding alone
- Don't use `display: inline-flex` for inline text highlight boxes — use `display: inline` with `em`-based padding so height matches the line height
- Don't write Tailwind `dark:` classes in React tools — the global.css override approach handles dark mode more reliably across the site
- Don't duplicate SEO metadata between `apps.ts` and page files — `ToolLayout` reads from `apps.ts`

---

## Current tool inventory

| Slug | Name | Category | Status |
|---|---|---|---|
| `tubetrace` | TubeTrace | YouTube / Data | Live |
| `json-formatter` | JSON Formatter | Developer Tools | Live |
| `ai-image-checker` | AI Image Checker | Image / Inspection | Coming Soon |
| `csv-cleaner` | CSV Cleaner | Data Tools | Coming Soon |

---

## UI component quick reference

| Component | File | Used for |
|---|---|---|
| `ToolLayout` | `components/layout/ToolLayout.astro` | Wraps every tool page |
| `MainLayout` | `components/layout/MainLayout.astro` | Wraps content pages |
| `ToolCard` | `components/apps/ToolCard.astro` | Grid items in Popular Tools section |
| `FeaturedCard` | `components/apps/FeaturedCard.astro` | Cards in "Free Tools You'd Usually Pay For" |
| `ToolMount` | `components/tools/ToolMount.astro` | Mounts the correct React tool by slug |
| `CookieBanner` | `components/site/CookieBanner.astro` | GDPR consent banner (auto-included in both layouts) |
| `Header` | `components/site/Header.astro` | Sticky navbar with mega-menus and search |
| `Footer` | `components/site/Footer.astro` | Dark footer |

---

## Planning constraints

- Preserve the single-domain monorepo architecture
- Assume tools are embedded by default (inside the main Astro site)
- English-first; keep localization possible without structural rewrites
- `apps/tubetrace` is imported source-of-truth code — do not delete or heavily modify it; fold it gradually into the hub route

---

## Content rules

- Use precise, non-hyped language in all copy
- For probabilistic/uncertain tools, add disclaimers — use the `disclaimer` field in `apps.ts`
- Privacy-first positioning: if a tool is browser-only, say so clearly and consistently
- Guide content is part of the SEO and monetization strategy — treat it seriously
