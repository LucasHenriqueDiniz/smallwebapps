# AGENTS — Small Web Apps

## What this project is

Small Web Apps (`smallwebapps.com`) is a product hub of free browser-based utilities. Every tool runs client-side. No file uploads to a server. No accounts. No paywalls.

Revenue model: AdSense + future premium tier. The site must be indexable, trustworthy, and fast.

---

## Architecture overview

```
apps/
  web/              ← main Astro site (canonical domain)
    src/
      components/
        layout/
          MainLayout.astro     ← wrapper for content pages (Header + Footer + Cookie + dark-theme init)
          ToolLayout.astro     ← wrapper for tool pages (minimal: breadcrumb + tool + footer)
        site/
          Header.astro         ← sticky navbar with mega-menus, search, dark toggle
          Footer.astro         ← dark footer with tool links, nav, legal
          CookieBanner.astro   ← GDPR cookie consent (Google Consent Mode v2)
        apps/
          ToolCard.astro       ← card used in Popular Tools grid
          FeaturedCard.astro   ← card used in "Free Tools You'd Usually Pay For"
        tools/
          ToolMount.astro      ← dynamically mounts the right React island by slug
      pages/
        index.astro            ← homepage
        apps/
          index.astro          ← tool directory (/apps)
          [slug].astro         ← individual tool page (uses ToolLayout)
        privacy.astro
        terms.astro
        contact.astro
        guides/
          index.astro
          [slug].astro
      data/
        apps.ts                ← single source of truth for all tool metadata
      styles/
        global.css             ← CSS vars for light/dark, Tailwind base, global overrides
  tubetrace/        ← standalone TubeTrace app (source of truth for that tool)
packages/
  data/             ← shared TypeScript types (AppDefinition, etc.)
```

---

## How to add a new tool

### 1. Add metadata to `apps/web/src/data/apps.ts`

```ts
{
  slug: "tool-name",
  name: "Tool Name",
  category: "Developer Tools",   // must match an existing category
  status: "live",                 // "live" | "coming-soon"
  mode: "embedded",
  implemented: true,
  shortDescription: "One sentence, no hype.",
  longDescription: "2-3 paragraphs explaining the tool, its use case, and why it belongs here.",
  appUrl: "/apps/tool-name",
  landingUrl: "/apps/tool-name",
  tags: ["tag1", "tag2", "tag3"],
  features: [
    "Feature described as a user benefit",
    "Feature 2",
    "Feature 3",
    "Feature 4",
  ],
  faq: [
    { question: "Question?", answer: "Answer." },
    { question: "Question 2?", answer: "Answer 2." },
  ],
  disclaimer: "Optional: short warning for uncertain/probabilistic tools.",
  seo: {
    title: "Tool Name — Small Web Apps",
    description: "140-160 char meta description targeting the tool's use case.",
  },
}
```

**Category must be one of:**
- `"Developer Tools"` — JSON, CSV, YAML, code utilities
- `"Image / Inspection"` — image manipulation, AI detection
- `"YouTube / Data"` — YouTube history, Takeout analysis
- `"Data Tools"` — CSV, spreadsheet, file cleanup
- `"PDF Tools"` *(future)*

### 2. Create the React tool component

Location: `apps/web/src/tools/[slug]/[SlugApp].tsx`

```tsx
// apps/web/src/tools/json-formatter/JsonFormatterApp.tsx
export default function JsonFormatterApp() {
  return <div>...</div>;
}
```

**React tool rules:**
- Must be a default export
- Use Tailwind utility classes (dark mode handled globally via CSS vars override in global.css)
- Do NOT use hardcoded dark colors — the global CSS override handles `bg-white`, `text-slate-*`, `border-slate-*` automatically in dark mode
- Keep the tool self-contained — no router, no global state
- Process all data client-side; never send user data to a server
- Show a disclaimer inline if the tool is probabilistic or uncertain

### 3. Register in ToolMount

Add the import and case to `apps/web/src/components/tools/ToolMount.astro`:

```astro
{slug === 'tool-name' && <ToolNameApp client:load />}
```

Import at top:
```astro
import ToolNameApp from "@/tools/tool-name/ToolNameApp.tsx";
```

For heavy tools, do not default to `client:load`. Use `client:visible` or a lightweight wrapper that loads expensive code only after user interaction.

### 4. The tool page is automatic

`apps/web/src/pages/apps/[slug].astro` automatically generates a page for every entry in `apps.ts`. It uses `ToolLayout` which provides:
- Sticky navbar (inherited from Header)
- Breadcrumb strip: `← All tools › Tool Name • Live • Category`
- Tool body (the ToolMount)
- Similar/related tools section for internal linking and retention
- Footer

No additional page file needed.

### 5. Update the header navigation (optional)

If the tool fits a nav category, add it to the mega-menu in `Header.astro` under the appropriate category's left panel and cards.

---

## ToolLayout vs MainLayout

| | ToolLayout | MainLayout |
|---|---|---|
| Use for | `/apps/[slug]` tool pages | all other pages |
| Header | ✅ | ✅ |
| Footer | ✅ | ✅ |
| Breadcrumb | ✅ (tool-specific) | ❌ |
| Max-width wrapper | ✅ (1280px with padding) | no (sections own their width) |
| `fullWidth` prop | expands to 100% — use for full-page tools | — |

---

## Design system

### CSS variables (light / dark)

All components must use CSS vars, not hardcoded hex values:

```css
--page-bg        background of the page
--nav-bg         navbar and sticky elements
--card-bg        card surfaces
--border         borders and dividers
--text           primary text
--muted          secondary/muted text
--blue           primary brand blue (#1a73e8)
--blue-dark      hover state for blue
--bg             section backgrounds (slightly off-main)
--input-bg       form inputs background
--shadow         standard box shadow
```

### Dark mode rules for new components

1. Use CSS vars for all colors — they auto-swap in dark mode
2. If you must use inline styles with hardcoded colors (e.g. category colors), add a `:global([data-theme="dark"]) .your-class` override
3. For Astro scoped styles targeting ancestor `[data-theme="dark"]`, use `:global([data-theme="dark"]) .your-class` — otherwise Astro scoping breaks the selector
4. React tool components use Tailwind. The global.css already overrides common Tailwind classes for dark mode:
   - `bg-white` → `var(--card-bg)`
   - `bg-slate-50` → `var(--input-bg)`
   - `text-slate-*` → mapped to `var(--text)` / `var(--muted)`
   - `border-slate-*` → `var(--border)`
   - Search bar inputs: `background: transparent` (override to prevent dark input background inside styled containers)

### Typography

Font: **Inter** (loaded via Google Fonts in MainLayout + ToolLayout)

- Headings: `font-weight: 800-900`, `letter-spacing: -0.5px` to `-1.5px`
- Body: `font-size: 0.85–1rem`, `line-height: 1.5–1.75`
- Labels/eyebrows: `font-size: 0.65–0.75rem`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.1em`

### Category color palette

Each category has a fixed color identity:

| Category | bg | color | gradient |
|---|---|---|---|
| YouTube / Data | `#fee2e2` | `#dc2626` | red |
| Developer Tools | `#dbeafe` | `#2563eb` | blue |
| Image / Inspection | `#ede9fe` | `#7c3aed` | purple |
| Data Tools | `#d1fae5` | `#059669` | green |
| PDF Tools | `#ede9fe` | `#7c3aed` | purple |

Use these consistently in: category cards, tool cards, FeaturedCards, /apps page, dropdowns.

---

## Tool page content rules

Every tool page renders: **Header + breadcrumb strip + tool UI + related tools + Footer**

The breadcrumb shows: `← All tools › Tool Name • ● Live • Category`

For tools with a disclaimer (e.g. AI-based tools), the disclaimer appears in the breadcrumb strip automatically via the `disclaimer` prop in `apps.ts`.

`apps/web/src/pages/apps/[slug].astro` computes related tools automatically from same category, shared tags, and live status. Keep this section concise (currently up to 6 items) and user-facing. Do not use internal/product wording.

**What NOT to do:**
- Do not add hero sections, FAQs, or feature lists to tool pages — the layout is intentionally minimal
- Do not show ads inside the tool body — AdSense is loaded globally via consent-gated scripts
- Do not redirect users away from `/apps/[slug]` for any reason

---

## Performance rules

- Tools must be **lazy-loaded** (`client:load` or `client:visible` in ToolMount)
- Tool components should not import large libraries unless absolutely necessary
- Images: use `loading="lazy"` and explicit `width`/`height`
- Keep bundle size in check. A tool chunk over ~100 KB should be reviewed; a chunk over ~250 KB needs a concrete reason and preferably deferred loading.
- Heavy libraries (`pdfjs-dist`, `pdf-lib`, `jspdf`, `html2canvas`, `jsQR`, `browser-image-compression`, OCR libraries, chart libraries) should be imported dynamically inside the user action that needs them whenever possible.
- Heavy tool pages should render useful static HTML quickly, then show a local loading/skeleton state such as "Loading PDF engine..." or "Preparing image tool..." while the tool hydrates or imports the heavy dependency.
- Prefer CSS/HTML charts and transitions over chart libraries for simple analytics. Do not add `recharts`, `framer-motion`, or similar for simple bars, counters, or small dashboards.
- Tool variants that reuse an existing component must not duplicate heavy code. Route variants through shared components/config.

---

## SEO and content rules

- Every `apps.ts` entry must have a real `seo.title` and `seo.description` (not placeholder text)
- `shortDescription`: 1 sentence, ≤90 chars, no marketing fluff, describes what the tool does
- `longDescription`: 2-3 sentences, explains use case and positioning (used in search/listing contexts)
- `tags`: 3-5 lowercase, searchable keywords
- `features`: 3-5 user benefits (not feature names — benefits)
- `faq`: minimum 2 real questions, honest answers including known limitations
- Prefer useful long-tail tool clusters over generic one-off tools. Good clusters include:
  - image compression targets: `compress-image-to-50kb`, `compress-image-to-100kb`, `compress-jpg-to-100kb`, `compress-png-to-100kb`
  - PDF compression targets: `compress-pdf-to-100kb`, `compress-pdf-to-200kb`, `compress-pdf-to-500kb`, `compress-pdf-to-1mb`
  - SEO utilities: `keyword-density-checker`, `meta-tags-analyzer`, `open-graph-checker`
- Variant tools should reuse the same implementation with config/presets. They need unique metadata, titles, descriptions, tags, features, and FAQs, but should not copy-paste tool logic.
- Be honest with target-size tools. Browser-side compression cannot always guarantee an exact size, especially for PDFs. Use wording like "try to compress toward 100 KB" when exact output cannot be guaranteed.
- Header navigation should not be flooded with every long-tail variant. Use `/apps`, search, footer/category pages, and related tools for discovery; keep header featured links focused on representative tools.

---

## Privacy and trust rules

- All tools must process data locally — no server uploads
- If a tool has any network calls (e.g. API-based AI), it must have a visible disclaimer
- Cookie consent is handled globally — do not add separate consent logic per tool
- The `disclaimer` field in `apps.ts` appears automatically in the tool page breadcrumb
- Do not claim a tool does more than it actually does (e.g. "proves" something it only "suggests")

---

## Monetization rules

- AdSense scripts are loaded globally via consent-gated `gtag` (Consent Mode v2)
- Ad slots should never interrupt the tool workflow
- The `/guides` section is a secondary monetization surface — keep guides useful and linked from tool pages
- Internal linking: every tool page should be reachable from the home page, `/apps`, and the header navigation
