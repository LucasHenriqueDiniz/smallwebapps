---
status: todo
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

- `/apps/tubetrace/` inbound from **every other indexable page** (19/19 with option A).
- Every YouTube guide: **≥ 10** inbound, depth ≤ 1 from `/`.
- 0 orphans, 0 broken links, `scan-links.mjs` exit 0.
- The same output on `dist/` and on production. If the two differ, the deploy is not what was built.

## If stuck

If putting every YouTube guide in the footer makes it unreadable, link them from a `/guides/` section
that the footer links, and accept depth 2 for the guides. The TubeTrace rule stays.
