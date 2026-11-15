---
tags:
  - pitch
  - seo
  - organic-traffic
status: proposed
epic: organic-traffic
kanban:
---

# Pitch — Earn search traffic from the one cluster Google has shown

## Problem

The site has never had a measured visitor from Search. Search Console, read 2026-11-15
([[2026-11-15-organic-traffic/research|research]]):

| window | clicks | impressions | position |
|---|---|---|---|
| last 28 days | 0 | 25 (−74%) | 11.7 |
| last 90 days | 0 | 198 | — |
| whole history (since 2026-06-01) | 1 | 300 | — |

AdSense has held the site at "Conteúdo de baixo valor" since 2026-08-27, and the review waits for
real clicks (2026-10-18 decision, amended). So traffic is now the blocker for everything else.

Indexing is not the problem it looks like. 33 of 47 sitemap URLs are indexed, up from 14 on
2026-10-18, and impressions fell by three quarters over the same four weeks. The research found four
causes:

1. **The index is mostly pages Google will not show.** 22 of the 28 indexable tools are PDF and
   image operations against iLovePDF, Smallpdf and 11zon. Google is declining them. 8 of the 10 PDF
   tools are out of the index, and 5 of those went from "Discovered" back to "unknown" in four weeks,
   after indexing was requested. The 12 image tools drew 14 impressions in 90 days. The angle the site
   sells, no upload, has no measurable demand: "merge pdf offline" reads 0 in Trends.
2. **The one cluster with impressions lost them.** `/apps/tubetrace/` drew 154 of the 198, at
   position 7.2. From the week of 2026-10-19 that fell from 14–27 a week to 1–5. The same week
   Google dropped the export guide from the index. 4 of the 7 YouTube guides are now out. Why this
   happened is not established: the PR #18 deploy (2026-10-18) and a Google re-crawl share the week.
3. **The links point elsewhere.** The footer links the first four tools of each category from every
   page, so `pdf-merge` has 46 inbound links and `/apps/tubetrace/` has 14.
4. **`www.smallwebapps.com` does not resolve.**

What Search shows is open (one reading of ten US result pages, 2026-11-15). For "export youtube watch
history", page one is Reddit, a 2016 Stack Exchange thread and GitHub. For "watch-history.json" and
"youtube takeout json vs html" it is small sites, and the AI Overview cites small sites. Since
2025-12-02 YouTube runs its own yearly Recap, built from watch history. It shows only the current
year and is not offered to every account. Every YouTube term in Trends peaks in the week of 2025-11-30,
and "youtube recap" goes from about 1 to 100. The related queries ask for **past years**
("youtube recap 2024", "2023", "2022") and for why it is **not showing**. A Takeout file answers
both, and the site already reads it.

## Solution

Put every hour into the YouTube Takeout cluster, narrow the index to it, and measure before adding
more.

1. **Hosts.** `www` → apex with a 301, the way tglinks and calculebrasil did it: proxied AAAA `100::`
   and a Redirect Rule `http*://www.smallwebapps.com/*` → `https://smallwebapps.com/${2}`, query
   preserved. ⚠️ Owner, in the Cloudflare dashboard.
2. **A recap for any year.** TubeTrace gains a year picker and a recap view for that year: videos,
   channels, top channels, most rewatched videos, busiest month, weekday and hour, the first video of
   the year. Read in the tab, like the rest of the tool. No watch time: Takeout records a timestamp
   per view, not a duration, and the page says so.
3. **One guide for the recap intents**: the official Recap shows one year and not every account
   gets it; here is how to see any year from your own Takeout. It answers "past years", "not
   showing" and "all-time" honestly, and links the year view.
4. **Narrow the index** to the cluster plus four privacy tools. The tools and guides in the
   research's per-tool table marked "cut" move to `noindex`, unlisted, still served, the same
   mechanism as 2026-10-18. Three overlapping pages merge behind a 301:
   `screenshot-to-text` → `image-to-text`, `image-metadata` → `exif-viewer`, and the
   `how-to-analyze-youtube-watch-history` guide → `/apps/tubetrace/`. 47 indexable URLs become 19
   (20 with the recap guide).
5. **Links point at the cluster.** The header and footer link TubeTrace and the YouTube guides from
   every page instead of whichever tools sort first. Fix the `/apps//` link.
6. **Re-earn the two guides Google dropped.** The export how-to is checked step by step against the
   live Takeout screens, and the file-format reference against a real export. Each page gains the
   one thing page one lacks, then indexing is requested. The daily indexing task is extended to
   guides.
7. **Gate.** Google's numbers at day 28 and day 42 decide whether to build more on the cluster,
   hold, or stop adding pages.

**On the December peak.** Slices 2 and 3 are worth most if Google has them before 2026-11-30. That
needs the plan approved by 2026-11-18 and the pages live by about 2026-11-22. A page submitted then
may still miss the peak week: the `/apps/` pages requested on 2026-10-22..24 were crawled one to two
and a half weeks later. Missing it does not kill the slices. Past-year searches run all year, and the
next peak is December 2027.

## Architecture

Static Astro on Cloudflare Pages; nothing runs on a server.

- **Year view**: inside `apps/web/src/tools/tubetrace/YouTubeWatchHistoryAnalyzerApp.tsx`, which
  already parses both Takeout formats into `{ time, channel, … }`. The per-year aggregation goes into
  a pure module next to it, so it can be tested without a browser. That is the same pattern as the
  modules extracted in `pure-logic-tests`.
- **Recap guide**: a new entry in `apps/web/src/data/guides.ts`, rendered by `guides/[slug].astro`.
- **Cut**: tool slugs join `COMMODITY` in `apps/web/src/data/indexing.ts`. Guides have no `noindex`
  flag today. One is added on the guide definition and read by `guides/[slug].astro`, the sitemap
  filter and the guide lists, so a guide is listed if and only if it is indexable, as tools are
  since 2026-10-18.
- **Merges**: `apps/web/public/_redirects`, with and without the trailing slash, as for the size
  variants.
- **Links**: `Header.astro`, `Footer.astro`, `data/home.ts`, `lib/related.ts`.
- **`www`**: Cloudflare zone only; recorded in `docs/` because dashboard-only config is invisible.

## Schema / Data Changes

- `GuideDefinition` gains an optional `indexable: false`.
- 3 URLs start answering 301. That is the one-way part, but none of the three has an impression in
  28 days.
- The rest is reversible one line at a time.

## Interfaces / APIs

| Method | Route | Change |
|---|---|---|
| GET | `https://www.smallwebapps.com/*` | from NXDOMAIN to 301 → `https://smallwebapps.com/*`, query kept |
| GET | `/apps/tubetrace/` | year picker and recap view, same URL |
| GET | `/guides/<recap-slug>/` | new guide; slug chosen in slice 3 |
| GET | `/apps/screenshot-to-text/`, `/apps/image-metadata/`, `/guides/how-to-analyze-youtube-watch-history/` (± `/`) | 301 to their merge target |
| GET | cut tools and guides | still 200, `noindex, follow`, no longer linked or in the sitemap |
| GET | `/sitemap-0.xml` | 47 → 20 URLs |

## Scope

### In
- [ ] `www` → apex 301 (owner); `smallwebapps.pages.dev` → apex only if PR previews survive it
- [ ] Recap for any year in TubeTrace
- [ ] The recap guide
- [ ] Index narrowed to the cluster + 4 privacy tools; 3 merges
- [ ] Sitewide links to the cluster; `/apps//` fixed
- [ ] Export guide and `watch-history.json` reference reworked against the live Takeout
- [ ] Daily indexing task covers guides (owner)
- [ ] Day-28 and day-42 gate, and the decision it writes

### Out
- Pages aimed at "youtube watch history analyzer" or "stats": three exact-match single-tool domains
  hold 1–3, and a multi-tool domain is not going to pass them with one page.
- Any new PDF, image or creator-tool page, and any work on the kept OCR/EXIF tools.
- Deleting the cut tools. They stay served, as the 114 did.
- An estimated "hours watched" figure. Takeout has no durations, so any hours figure would rest on
  an assumed average length. Goes to `docs/IDEAS.md` with what would make it honest.
- Search history, comments, YouTube Music recap, shareable recap image: `docs/IDEAS.md`.
- The AdSense review. It still waits for clicks; the gate proposes the number.
- Reading the PDF/image/OCR result pages that Google's block stopped. Nothing here depends on them.

## Research Needed

- [x] Why are indexed pages not shown? Partly answered: demand mismatch, Google declining the PDF pages,
      links pointing away. The drop of 2026-10-19 is unexplained. [[2026-11-15-organic-traffic/research|research]] findings 1–4
- [x] Which queries can each tool rank for, and what to cut? Per-tool table, finding 7
- [x] Volume: three vendor anchors and Trends ratios. Every derived number is marked ESTIMATE, finding 6
- [x] How to 301 `www`: finding 8, the sibling sites' rule
- [x] Owner, 2026-11-15: **option A**, the index narrows to 20 URLs (decision of 2026-11-15 in
      `docs/architecture/ARCHITECTURE.md`)
- [ ] ⚠️ **Owner**: request a Takeout export of YouTube watch history now. Slice 2's test needs a real
      file, and Takeout can take hours to days to deliver

## Testing Strategy

Two clocks, kept apart.

- **Ours.** Every slice ends in a command against production or the built site, compared with an
  oracle that is not our own code: `curl` over the 47 sitemap paths for hosts; `jq` over a real
  `watch-history.json` for the year view; the live Takeout screens for the export guide; the link
  graph for navigation; `scan-links.mjs` and the sitemap count for the cut.
- **Google's.** URL Inspection at day 28, impressions and clicks at day 42 (`sitestats`). These
  decide the next step, not whether a slice is done.

## Success Criteria

- [ ] `www`: 47/47 sitemap paths answer one 301 to the same path on the apex
- [ ] Year view: for every year in the owner's real export, videos, channels and top-5 channels equal `jq` (N/N)
- [ ] Sitemap lists 20 URLs; every cut URL serves `noindex` (N/N); 3/3 merges answer one 301
- [ ] `/apps/tubetrace/` linked from every other indexable page (19/19)
- [ ] Day 28 after the recap guide ships: ≥ 7 of the 8 cluster URLs indexed (today 4 of 7)
- [ ] Day 42: the cluster earns ≥ 150 impressions and ≥ 5 clicks over days 14–42. The best 28 days
      so far were about 90 impressions (TubeTrace, 2026-09-07..10-04), and the site's clicks ever
      number 1
