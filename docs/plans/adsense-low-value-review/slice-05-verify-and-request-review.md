---
status: todo
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
3. AdSense → Sites → smallwebapps.com → **Request review**. Do not remove and re-add the site; Google
   says that delays the review.
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
