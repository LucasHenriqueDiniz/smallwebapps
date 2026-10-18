---
status: done
kanban:
---

# Slice 2 — Link only the tools the site indexes

## Delivers

One rule from the 2026-10-18 decision in `docs/architecture/ARCHITECTURE.md`: **a tool is linked from
navigation if and only if `isIndexable(slug)`**. The 114 commodity tools stay live at their URLs,
`noindex, follow`, and nothing on the site links to them any more.

Surfaces, measured on production 2026-10-18 (links to `noindex` tools per page):

| surface | where | today |
|---|---|---|
| header mega menu | `components/site/Header.astro:56` tops each category up to 4 with non-indexable tools | 8 on every page |
| header search | `Header.astro:30`, `searchApps` built from all of `apps` | all 142 |
| home page | `pages/index.astro` `popularSlugs`, `featured`, hero quick links, category cards | 13 |
| `/apps/` index | `pages/apps/index.astro` | 114 |
| related tools | `pages/apps/[slug].astro` `relatedApps`, which only boosts indexable tools | up to 6 per page |
| guide calls to action | `data/guides.ts` `relatedToolSlug: "json-formatter"` and `"csv-cleaner"` | 2 guides |

Developer Tools (54 tools, 0 indexable) and Data Tools (41, 0 indexable) leave navigation as a
consequence. Any surface that lists categories lists three: YouTube / Data, Image / Inspection and
PDF Tools. Every count shown to visitors — category counts, "N tools" — comes from the linked set, so
no number claims tools a visitor cannot reach.

Home page *content* is slice 3. This slice only makes the home page's lists draw from the indexable
set.

The two guides whose tool is unlisted, JSON and CSV, keep their text and lose their tool call to
action. Their content stands without it, and the decision was "nothing navigating the site reaches
them".

## Needs

Slice 1 merged, so that `SIZE_VARIANTS` is gone and indexable means exactly 28 tools.

## Tests

- One exported list or helper in `apps/web/src/data/` that every navigation surface draws from.
  Vitest: every slug it yields is indexable, and its length is 28.
- Vitest per pure helper that a surface uses (related-tool ranking, header featured): fed a catalog
  with a `noindex` tool that would win on score, the helper does not return it.
- Revert one surface to `apps` and confirm its test goes red. A test that stays green without the fix
  is rewritten.

## Done when

```bash
pnpm --dir apps/web run build && pnpm --dir apps/web test --run
```

exit 0, and a scan of every indexable page in `apps/web/dist` (home, `/apps/`, the 28 tools, the 12
guides, `/guides/`, About, Contact, Privacy, Terms) finds **0** `href` pointing at a slug in
`noindexSlugs`. The scan is a short script committed under `apps/web/scripts/`, run as
`pnpm --dir apps/web run scan:links`, so the number can be reproduced instead of quoted. Given a base
URL, it scans production instead of `dist`. Slices 3 and 4 add their checks to it.

After deploy, the same scan against production also prints 0.

## If stuck

If the header search needs the full catalog to stay useful, it searches the linked set only. A
visitor can still type the URL of an unlisted tool. The search is navigation, and the decision covers
navigation.

## Closed 2026-10-18

Committed in `763c9db`. A follow-up fix to the related heading landed in `a4937cf`.

`scan:links` against production before the change: 47 sitemap pages, **142** distinct tools linked,
**502** links to `noindex` tools. Against the build after: 47 pages, **28** tools linked, **0**.
Restoring one guide's call to action brings it back to 2. Vitest: the three mutations — related
without the listed filter, `json-formatter` back in the hero, `listedApps` as the whole catalog —
each turn a test red.

The plan said "header search: all 142". The search JSON is not an href, so `scan:links` does not
see it. It was changed anyway and is covered by `listedApps` only.

A regression shipped in this slice and was caught in slice 4. The related heading fell back to
"Other tools on this site" whenever one of the six neighbours came from another category, which
hit the six YouTube tools and `pdf-ocr`. `scan:links` now flags any listed tool page without a
"More tools in" block, and reverting the fix flags those 7 pages.

`.well-known/agent-index.json` still lists all 130 tools. It is a machine catalog, not navigation,
and the decision covers navigation.
