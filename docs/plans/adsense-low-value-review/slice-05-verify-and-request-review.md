---
status: doing
kanban:
---

# Slice 5 — Verify in production, then request the review

## Delivers

The AdSense review requested against a site where slices 1–4 are measured live, plus the owner-only
actions that no commit can do.

Agent, against production after the deploy of slices 1–4:

- 24 of 24 retired variant URLs answer one 301 to their target;
- the slice-2 link scan prints 0 against `https://smallwebapps.com`;
- 28 of 28 indexable tool pages render one `<main>`;
- the sitemap still lists 47 URLs, since the variants were never in it, and all 47 answer 200;
- the home page title and H1 are the approved copy.

Owner, in this order:

1. Search Console: request indexing for the 7 unindexed guides and the 23 unindexed tool pages,
   within the daily quota. The list is in
   `docs/research/2026-10-18-adsense-low-value-review/url-inspection-2026-10-18.json`.
2. Cloudflare: delete the orphaned `tubetrace` Pages project, which also ends the failing check on
   every PR, or point `tubetrace.pages.dev` at `/apps/tubetrace/`.
3. AdSense → Sites → smallwebapps.com → **Request review**, *once Search Console shows real clicks*
   (amended 2026-10-18; see below). Do not remove and re-add the site; Google says that delays the
   review.
4. After approval, not before: Privacy & messaging → European regulations message, and the ad slot
   IDs.

## Needs

Slices 1–4 merged and deployed. The headline approved (slice 3).

## Tests

The production measurements above. Each one is a number, recorded in this file when the slice closes.

## Done when

The AdSense Sites page shows smallwebapps.com as **Getting ready** — review in progress — and the
five production measurements are recorded below with their values.

The slice closes. The epic does not: it closes on **Ready** or on a second *Needs attention*, and
either one is a postmortem.

## If stuck

If Request review is not offered — for example because the site is already in review — record the
status shown and wait. Do not remove the site.

## Progress 2026-10-18

**Production, measured after merge `4cca16b` deployed. It took about 180 s from merge to the new
title being served:**

| check | result |
|---|---|
| `scan:links https://smallwebapps.com` | 47 sitemap pages, 28 tools linked, **0** links to unlisted tools, 0 stale headings, 0 tool-page problems; exit 0 |
| retired variant URLs | **24/24** answer one 301 to a target that answers 200 |
| sitemap | 47 URLs, all 200 |
| an unlisted tool, `/apps/json-formatter/` | 200, `noindex, follow`, still live |

The same scan against the branch preview (`4c1da088.smallwebapps.pages.dev`) gave the same numbers
before merge.

**Search Console:** indexing requested and confirmed ("Indexação solicitada") for 10 URLs: the 7
unindexed guides, About, Contact and Privacy. The 23 unindexed tool pages are still to do, a few a
day. Their list is in `url-inspection-2026-10-18.json`.

**AdSense: review not requested, by owner ruling.** The verdict panel, read just before clicking,
requires "interesse genuíno do usuário" (`fetches/adsense-site-detail-panel.md`), and the site had
0 clicks in 90 days. Request the review when Search Console shows real clicks. The panel gives no
number, so the owner judges from:

```bash
~/.claude/skills/site-stats/bin/sitestats summary --site smallwebapps --days 28
```

Still open: the Cloudflare `tubetrace` project, which is the owner's to delete. AdSense also lists
`tubetrace.pages.dev` as a separate site at "Conteúdo de baixo valor", with ads.txt "Não
encontrado".
