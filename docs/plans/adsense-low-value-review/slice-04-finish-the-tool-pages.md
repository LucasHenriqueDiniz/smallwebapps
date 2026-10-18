---
status: todo
kanban:
---

# Slice 4 — A `<main>` on tool pages, and no "planned" features

## Delivers

- `components/layout/ToolLayout.astro` renders exactly one `<main>` around the tool and its reference
  content: H1 through FAQ, before "More tools in". `MainLayout.astro` already has one, and tool pages
  are the only template without it. Header, breadcrumb strip, related tools and footer stay outside.
- The five indexable tool pages that announce unbuilt features ("planned", "future update", "not
  yet", "no option yet") state what the tool does instead. `image-crop` is one: "Drag-to-crop is
  planned for a future update" becomes a plain limitation, "Cropping uses numeric coordinates and
  aspect-ratio presets."

## Needs

The scan script from slice 2, which knows the indexable set. Nothing else from slices 1-3.

## Tests

None in vitest. This is markup and copy, and the build output is the test.

## Done when

```bash
pnpm --dir apps/web run build
pnpm --dir apps/web run scan:links
```

The scan, extended in this slice, reports per indexable tool page the number of `<main>` elements and
of matches for `planned|future update|not yet|no option yet`. It must report 28 of 28 pages with
exactly one `<main>` and 0 phrase matches. Word counts on the 28, H1 to "More tools in", stay within ±5% of the 2026-10-18
measurement (median 733).

## If stuck

If wrapping in `<main>` breaks the stage grid layout, put `<main>` on the existing content wrapper
element instead of adding a new one, using `display: contents` only as a last resort.
