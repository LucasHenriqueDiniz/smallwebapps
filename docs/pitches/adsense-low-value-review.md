---
tags:
  - pitch
  - adsense
  - seo
  - home
status: active
epic: adsense
kanban:
---

# Pitch — Pass the AdSense low-value-content review

## Problem

AdSense has listed smallwebapps.com as **Needs attention: Low value content** since its review of
2026-08-27 09:54. The site serves no ads and earns nothing. The `ads.txt` line is authorised and the
loader is live on every indexable page, so the content verdict is the only thing standing between
the site and ad serving.

That review is older than every fix since. The first corrective commit (`4cd5863`) landed the same
day, after it. Google has not looked at the current site. Requesting a review now would still mean
showing it a site with four problems, measured against production on 2026-10-18:

- **The home page shows a reviewer the tools the site itself took out of the index.** The title is
  "Free Browser Tools for Data and Developers". The first featured card and the first hero link are
  the JSON Formatter. Of the tools the home page links, 14 are in `COMMODITY` in
  `apps/web/src/data/indexing.ts`, including `json-formatter`, `password-generator`,
  `regex-tester`, `bmi-calculator`, `age-calculator` and `file-hash`. A reviewer arrives at the
  home page, not through the sitemap, and `noindex` does not change what they click. The claim that
  the AdSense review ignores `noindex` is an inference: Google documents nothing either way.
- **The doorway pages are still live and linked.** `indexing.ts` calls the 12 size and format
  variants (`compress-pdf-to-100kb`, `jpg-to-text`, …) "the shape Google's guidance calls a doorway
  page". They answer 200, and 9 of them are linked from `/apps/`.
- **Little of what is indexed stands out.** About 20 of the 28 indexed tools are generic PDF and
  image operations that compete with iLovePDF and Smallpdf, and `image-crop` does less than the
  market baseline: no drag to select. TubeTrace and the YouTube/Takeout guides are the part that is
  genuinely the site's own, and they drew 148 of roughly 295 impressions.
- **The site has no audience yet.** Search Console for 2026-07-19 to 2026-10-16 shows 0 clicks and
  about 295 impressions. On 2026-09-12, 11 of the 12 guides were unindexed (`330a61d`). Google's
  eligibility page asks for content that will "attract an audience".

The measurable parts already pass. All 47 sitemap URLs return 200. The indexed tool pages run 584 to
1529 words from H1 to the related links, with a median of 733. Pairwise 5-gram similarity has a
median of 0.073 and a maximum of 0.256. The 12 guides run 1226 to 1465 words. About and Contact are
real pages. **What remains is what a reviewer sees, and whether Google indexes any of it.**

Three smaller defects sit next to these. `ToolLayout.astro` renders no `<main>`, where every other
layout does. The consent banner is not a Google-certified CMP: per Google, "only traffic from a
certified CMP is eligible for personalized ads" in the EEA, UK and Switzerland. And
`tubetrace.pages.dev`, the orphaned Cloudflare project, still serves TubeTrace with the same
`ca-pub`, a self-canonical and `index, follow`. See [[tubetrace-single-source]].
## Solution

Every path a reviewer can take from the home page should lead to what the site indexes. Request a
review only after Google has indexed it.

1. **Home page.** Derive the hero links, featured cards and popular list from the indexable set
   instead of hand-written slug lists, so the two cannot drift apart again. Rewrite the title and
   hero around what the site is actually good for: TubeTrace and the YouTube/Takeout cluster, plus
   local PDF and image tools.
2. **Doorway variants.** Retire the 12 pages and 301 each one to its base tool. If the base tool
   lacks the target-size behaviour a variant offered, the variant's preset moves into the base tool
   as an option, not into a new page.
3. **`<main>` on tool pages.** One landmark around the tool and its reference content, in
   `ToolLayout.astro`.
4. **The five "planned / future update / not yet" lines** on indexed pages become plain statements
   of what the tool does.
5. **Request indexing, then request review.** The owner requests indexing in Search Console for the
   7 guides that are not yet indexed and for the tool pages that are not. The AdSense review is
   requested once items 1–4 are live in production. It is not held back for an indexing threshold,
   because no source ties Search indexing to approval. See [[2026-10-18-adsense-low-value-review/research|research]], finding 5 and verdict 3.
6. **Dashboard actions, owner only:**
   - enable AdSense's own GDPR message under Privacy & messaging;
   - delete or redirect the `tubetrace` Cloudflare Pages project.

## Architecture

Static Astro output on Cloudflare Pages. Nothing is added at runtime.

- `apps/web/src/data/indexing.ts` already owns the indexable set (`isIndexable`, `noindexSlugs`).
  The home page reads from it instead of keeping its own `popularSlugs` and `featured` arrays in
  `apps/web/src/pages/index.astro`.
- Redirects go in `apps/web/public/_redirects`. The file already carries 301s with trailing-slash
  targets. Sources match exactly, so each retired URL needs a line with and a line without the
  trailing slash: `/tubetrace-app` without one answers 404 in production today.
- The variants live in `seoClusterApps` in `apps/web/src/data/apps.ts`, are mounted in
  `apps/web/src/components/tools/ToolMount.astro`, and are listed in `SIZE_VARIANTS` in
  `indexing.ts`. All three places change together.

## Schema / Data Changes

- **12 entries leave `seoClusterApps`**, along with their `ToolMount.astro` branches and their
  `SIZE_VARIANTS` lines. Reversible in git.
- **The 12 URLs start answering 301. This is the one-way part.** Once Google follows a permanent
  redirect it drops the old URL. Bringing the pages back later would mean they start from nothing
  in the index. They have no clicks today, so the cost is small, but it is not zero.
- No config or environment variable changes. The ad slot IDs (`PUBLIC_ADSENSE_SLOT_*`) stay unset
  until approval.

## Interfaces / APIs

| Method | Route / Entry point | Auth | Description |
|--------|---------------------|------|-------------|
| GET | `/apps/compress-pdf-to-{100kb,200kb,500kb,1mb}[/]` | none | 301 to `/apps/pdf-compress/`. `targetKB` only changes two strings, so nothing is lost |
| GET | `/apps/compress-image-to-{50kb,100kb,200kb}[/]` | none | 301 to `/apps/image-optimize/`, whose max-size slider covers the preset |
| GET | `/apps/compress-{jpg,png,webp}-to-100kb[/]` | none | 301 to `/apps/image-optimize/` |
| GET | `/apps/jpg-to-text[/]`, `/apps/png-to-text[/]` | none | 301 to `/apps/image-to-text/`: same component, wider `accept` |
| GET | `/` | none | Links only to indexable tools |

## Scope

### In Scope
- [ ] Home page hero, featured and popular derived from the indexable set
- [ ] Home title and hero copy repositioned
- [ ] 12 doorway variants removed and 301'd
- [ ] `<main>` in `ToolLayout.astro`
- [ ] Rewrite of the five "planned / not yet" lines
- [ ] Unlink the 114 commodity tools from every navigation surface: header menu, header search, home,
      `/apps/`, related tools and guide calls to action
- [ ] Owner checklist: indexing requests, GDPR message, Cloudflare `tubetrace` project, review request

### Out of Scope
- Deleting the 114 commodity tools. They are unlinked, not deleted. See the 2026-10-18 decision in
  `docs/architecture/ARCHITECTURE.md`.
- New tools, and new guides
- Drag-to-crop or any other feature work on `image-crop`
- Configuring ad slot IDs or Auto ads, which belongs after approval
- Integrating a third-party CMP in code. AdSense's own message is a dashboard switch.
- The `apps.ts` split; see [[app-catalog-size]]
- The undercount in the auditor skill's `analyze_text_depth.py`, which belongs to another repo and
  task

## Research Needed
- [x] Does the AdSense review weigh `noindex` pages it can reach by link? No source excludes them,
      and AdSense says it "may review all pages of your site". Plan as if they count. [[2026-10-18-adsense-low-value-review/research|research]]
- [x] Owner decision, 2026-10-18: unlist the 114 and keep their URLs. Developer Tools and Data Tools
      leave navigation with them, because neither has an indexable tool.
- [x] Redirect targets: `image-optimize`, `pdf-compress` and `image-to-text`, as in Interfaces.
      No feature is lost; see [[2026-10-18-adsense-low-value-review/research|research]], finding 2.
- [x] Target size: the image base already has the max-size slider. The PDF variants never aimed at a
      size at all, so nothing needs adding.
- [x] Indexing coverage: 14 of 47 indexed, 7 crawled and not indexed, 22 discovered, 4 unknown
      (URL Inspection API, 2026-10-18). [[2026-10-18-adsense-low-value-review/research|research]], finding 4.
- [x] Owner decision, 2026-10-18: request the review as soon as the fixes are live. No indexing
      threshold.
- [ ] Does AdSense's GDPR message replace the custom banner, or sit on top of it? Still open, and
      it does not affect approval, so it moves to after approval.
- [x] Waiting period or penalty for asking again: none documented. A review takes a few days to 2-4
      weeks. Do not remove and re-add the site.
- [x] Home page direction, owner 2026-10-18: local processing, "nothing is uploaded". The exact
      wording is proposed in the plan for the owner to approve.

## Testing Strategy

Prove it against the built site and production, not against the suite alone.

- **Unit (vitest, `apps/web`):** every slug the home page links is indexable. Revert the derivation
  to a hand-written list containing `json-formatter` and confirm the test goes red.
- **Build output (`apps/web/dist`):**
  - count the `/apps/` links in `index.html` that point at `noindex` slugs; expected 0;
  - count `<main>` per tool page; expected exactly 1 on all 28 indexable tool pages;
  - grep for "planned", "future update" and "not yet" on indexable pages; expected 0.
- **Production, after deploy:**
  - `curl -sI` each of the 12 variant URLs and record status and `location`; expected 12 of 12 at
    301, each with a trailing-slash target and one hop;
  - recount H1-to-related-links words on the 28 indexable tool pages, so that adding `<main>` and
    the copy edits did not shrink them;
  - the sitemap still lists 47 URLs, all 200.
- `pnpm --dir apps/web run build` and the three `.claude/skills/*-validator.sh` scripts pass.

## Success Criteria
- [ ] Home page: 0 links to `noindex` tools, measured on production HTML
- [ ] 12 of 12 variant URLs answer a single 301 to their base tool in production
- [ ] 28 of 28 indexable tool pages render exactly one `<main>`
- [ ] Review requested only after items 1–4 are verified in production
- [ ] AdSense site status moves from "Needs attention" to "Ready"
