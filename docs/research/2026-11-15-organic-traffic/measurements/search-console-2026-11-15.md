---
tags: [measurement, 2026-11-15-organic-traffic]
measured: 2026-11-15
---

# Search Console, property `smallwebapps`, read 2026-11-15

Read with `~/.claude/skills/site-stats/bin/sitestats` (Search Console API, `dataState: all`, 2-day
lag). Web search only: `--type image`, `video` and `discover` return 0 rows for the whole 16 months.

Two counting rules matter below. Property-level rows (`summary`, `--dim date|country|device|query`)
count one impression per search. Page-level rows (`--dim page`) count one per URL shown, so they sum
higher. And Google withholds rare queries, so `--dim query` rows add up to far less than the total.

## Totals

| window | clicks | impressions | position | command |
|---|---|---|---|---|
| 2026-10-17 .. 2026-11-13 (28 d) | 0 | 25 (−74.0% against the 28 d before) | 11.7 | `sitestats summary --site smallwebapps --days 28` |
| 2026-08-16 .. 2026-11-13 (90 d) | 0 | 198 | — | `sitestats gsc smallwebapps --dim page --days 90` |
| since the first row (2026-06-01) | 1 | 300 | — | `--dim date --start 2025-07-01` |

By month (`--dim date`, summed; position weighted by impressions):

| month | impressions | clicks | position |
|---|---|---|---|
| 2026-06 | 27 | 1 | 13.8 |
| 2026-07 | 27 | 0 | 21.0 |
| 2026-08 | 87 | 0 | 32.6 |
| 2026-09 | 81 | 0 | 5.5 |
| 2026-10 | 67 | 0 | 7.6 |
| 2026-11 (1–13) | 11 | 0 | 4.8 |

## Pages, 90 days (2026-08-16 .. 2026-11-13)

26 URLs had at least one impression. `/apps/tubetrace/` alone carries **154**, at position 7.2.

| page | impressions | position |
|---|---|---|
| `/apps/tubetrace/` | 154 | 7.2 |
| `/` | 16 | 19.6 |
| `/guides/how-to-export-youtube-watch-history/` | 16 | 33.2 |
| `/apps/` | 14 | 5.5 |
| `/guides/` | 10 | 3.9 |
| `/terms/` | 10 | 4.7 |
| `/apps/image-resize/` | 7 | 7.9 |
| `/guides/how-to-analyze-youtube-watch-history/` | 6 | 43.3 |
| `/about/` | 5 | 25.0 |
| `/apps/youtube-tag-extractor/` | 5 | 5.6 |
| `/apps/image-crop/` | 4 | 10.0 |
| `/contact/` | 4 | 2.0 |
| `/privacy/` | 4 | 4.0 |
| `/apps/image-to-pdf/` | 3 | 7.7 |
| `/apps/pdf-compress/` | 3 | 5.0 |
| `/guides/what-your-youtube-history-reveals/` | 3 | 9.3 |
| `/apps/markdown-table-generator/` (noindex since 2026-10-18) | 2 | 8.0 |
| `/apps/pdf-watermark/` | 2 | 5.0 |
| 8 more URLs | 1 each | 2–76 |

## Pages, 28 days (2026-10-17 .. 2026-11-13)

13 URLs had an impression. Of the 28 tool pages, three: `/apps/tubetrace/` 18 (position 8.2),
`/apps/image-crop/` 4, `/apps/image-resize/` 4. The other 25 tool pages: 0. `/about/`, `/contact/`,
`/privacy/` and `/terms/` drew 17 between them, at positions 2–25.

## Queries

Over the whole history Google shows 7 queries, 9 impressions:

| query | page | impressions | position |
|---|---|---|---|
| watch-history.json | `/apps/tubetrace/` | 2 | 63.5 |
| youtube data viewer | — | 2 | 83 |
| google takeout youtube history | `/apps/tubetrace/` | 1 | 48 |
| how to export youtube history | — | 1 | 7 |
| youtube export | `/guides/how-to-export-youtube-watch-history/` | 1 | 67 |
| mini web app | `/about/` | 1 | 97 |
| apps4lifehost | — | 1 | 57 |

So 150 of `/apps/tubetrace/`'s 154 impressions came from queries Google withholds as rare, and
those sat near position 5, while the queries it does show sat at 48–64.

## `/apps/tubetrace/`, by week (`--dim page,date`)

| week of | 07-06 | 07-13 | 07-27 | 08-03 | 08-10 | 08-17 | 08-24 | 08-31 | 09-07 | 09-14 | 09-21 | 09-28 | 10-05 | 10-12 | **10-19** | 10-26 | 11-02 | 11-09 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| impressions | 3 | 1 | 4 | 3 | 4 | 5 | 3 | 7 | 21 | 17 | 27 | 25 | 22 | 14 | **5** | 1 | 2 | 5 |

Six weeks at 14–27 a week, then 1–5 a week from the week of 2026-10-19. Two things happened that
week. PR #18 deployed on 2026-10-18: the home page, header, footer and related links changed, and
the 12 size variants became 301s. And Google crawled `/guides/how-to-export-youtube-watch-history/`
on 2026-10-19 and dropped it from the index (see `url-inspection-2026-11-15.md`).

## Country and device, by week (whole property)

| week of | US | other | desktop | mobile |
|---|---|---|---|---|
| 07-20 | 3 | 3 | 6 | 0 |
| 07-27 | 8 | 8 | 16 | 0 |
| 08-03 | 11 | 11 | 22 | 0 |
| 08-10 | 9 | 17 | 26 | 0 |
| 08-17 | 5 | 9 | 12 | 2 |
| 08-24 | 2 | 13 | 14 | 1 |
| 08-31 | 9 | 2 | 11 | 0 |
| 09-07 | 23 | 0 | 23 | 0 |
| 09-14 | 17 | 0 | 17 | 0 |
| 09-21 | 24 | 5 | 29 | 0 |
| 09-28 | 24 | 2 | 26 | 0 |
| 10-05 | 19 | 5 | 24 | 0 |
| 10-12 | 13 | 1 | 14 | 0 |
| 10-19 | 3 | 3 | 6 | 0 |
| 10-26 | 0 | 3 | 2 | 1 |
| 11-02 | 2 | 0 | 2 | 0 |
| 11-09 | 3 | 6 | 7 | 2 |

90 days: 187 of 193 impressions on desktop; US 144 at position 5.1, Hong Kong 12, Vietnam 7, Brazil
5, India 5, 13 more countries at 1–3.

**Reading, not measured.** 144 US impressions at an average position of 5.1, with 0 clicks, is
unusual for people searching. Two explanations fit and neither can be told apart from this data:
rank-tracking or scraping tools that load result pages without clicking, or a result page where
position 5 sits below an AI Overview and video blocks that take the click. `serp-us-2026-11-15.md`
shows what the result pages look like today.

## AdSense pageviews (context, not Search)

`sitestats summary` for 2026-10-17 .. 2026-11-13 counts 25 pageviews on smallwebapps.com, 6 on
smallwebapps.pages.dev and 15 on tubetrace.pages.dev, the orphan project deleted on 2026-11-14.
Pageviews include the owner's own visits, so they are not audience.
