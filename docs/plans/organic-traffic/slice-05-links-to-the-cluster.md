---
status: done
kanban:
---

# Slice 5 — Links lead to the cluster

## Delivers

Measured 2026-11-15 on production (`measurements/internal-links-2026-11-15.md`): the footer links
the first four listed tools of each category from every page, so 12 tools have 46 inbound links.
`/apps/tubetrace/`, the page with 154 of the site's 198 impressions, has 14. The YouTube guides
have 5–6 each and sit two clicks deep.

After:
- **Header and footer** link `/apps/tubetrace/` and the YouTube guides on every page. The footer's
  per-category lists are ordered by an explicit priority in `data/listed.ts`, not by catalog order.
- **Home** leads with TubeTrace and the recap guide (slice 3). `data/home.ts` already puts TubeTrace
  first; it gains the guides.
- **Kept privacy tools** (OCR, EXIF) link `privacy-first-file-tools-local-processing` and each
  other. They do not link the YouTube cluster just to add links.
- **Fix** the "Browse all tools" button in `privacy-first-file-tools-local-processing`, which points
  at `/apps//`.

A link graph script, `apps/web/scripts/link-graph.mjs`, turns the measurement into a check. It reads
`dist/` or a base URL, like `scan-links.mjs`, and prints, per sitemap URL, its inbound count and its
depth from `/`.

## Needs

Slice 4, so that the graph is drawn over the final indexable set. Slice 3, for the recap guide's
link targets.

## Tests

- The script runs in CI on `dist/` and exits 1 when a rule below fails.
- Revert check: restore the current footer ordering on a branch; the TubeTrace rule fails.

## Done when

```bash
node apps/web/scripts/link-graph.mjs https://smallwebapps.com
```

**Baseline, 2026-11-15:** `/apps/tubetrace/` 14 inbound of 46 possible; YouTube guides 5–6, depth 2;
1 broken link (`/apps//`).

- `/apps/tubetrace/` inbound from **every other indexable page** (19/19).
- Every YouTube guide: **≥ 10** inbound, depth ≤ 1 from `/`.
- 0 orphans, 0 broken links, `scan-links.mjs` exit 0.
- The same output on `dist/` and on production. If the two differ, the deploy is not what was built.

## If stuck

If putting every YouTube guide in the footer makes it unreadable, link them from a `/guides/` section
that the footer links, and accept depth 2 for the guides. The TubeTrace rule stays.

## Progress

**2026-11-15: built and checked on `dist`. Waiting on merge and the same run against production.**

Baseline moved before this slice started. After slice 4 the header menu lists all five tools, so
`/apps/tubetrace/` was already linked from 19/19 pages in production. The YouTube guides were not:
5–6 inbound links each, two clicks from `/`. The `/apps//` link was fixed in slice 4.

What changed:
- `apps/web/scripts/link-graph.mjs` (new, `pnpm --dir apps/web run link:graph [base URL]`): inbound
  links and depth from `/` for every sitemap page, and the three rules of "Done when". It exits 1 when
  one fails. CI gains a "Built Site" job that builds and runs `scan-links` and `link-graph` on
  `dist/`. Cloudflare Pages builds but runs neither, and the workflow comment says so.
- Footer: a "Guides" column on every page with the eight listed guides, recap guide first, short
  labels. Order and labels live in `data/listed.ts` (`GUIDE_NAV`). `listed.test.ts` fails when a
  listed guide is missing or an unlisted one is named.
- `TOOL_NAV_ORDER` in `data/listed.ts`: navigation orders tools by an explicit list, TubeTrace first,
  instead of catalog order.
- Home: under the hero's tool links, a "Guide:" line to the recap guide (`heroGuideSlug` in
  `data/home.ts`, tested to be a listed guide).
- `privacy-first-file-tools-local-processing` gains `alsoForTools`: the four privacy tools list it in
  their own guide block. They already linked each other through related tools.

Measured:

| check | production before (2026-11-15, after slice 4) | `dist` after |
|---|---|---|
| `/apps/tubetrace/` inbound | 19/19 | 19/19 |
| YouTube guides with ≥ 10 inbound and depth ≤ 1 | **0/7** (5–6 inbound, depth 2) | **7/7** (19 inbound, depth 1) |
| `privacy-first-file-tools-local-processing` inbound | 1 | 19 |
| orphans / unreachable | 0 | 0 |
| `link-graph.mjs` exit | 1 | **0** |
| `scan-links.mjs` exit | 0 | 0 |
| privacy tools: guide in their own guide block / link the other three | 0/4 / 4/4 | **4/4** / 4/4 (TubeTrace as control: guide absent) |
| vitest / `astro check` / validators | 153 | 157 (4 navigation-order tests) / 0 errors / 3 × exit 0 |

Revert check: production today *is* the revert state, since it lacks the footer column and the
hero line. The same script on it prints the guide rule `FAIL 0/7` and exits 1.

**Production, 2026-11-15** (PR #26, merged as `0ca5d48` at 17:38 UTC, live about 90 s later):
`link-graph.mjs https://smallwebapps.com` prints the same table as `dist`. Every one of the 20 pages has 19
inbound links, `/` is at depth 0 and the rest at depth 1, and the three rules pass (TubeTrace 19/19,
YouTube guides 7/7, 0 orphans). Exit 0. `scan-links.mjs` on production: exit 0. The CI "Built Site"
job on the PR built 148 pages in 13.6 s and ran both scripts green.
