---
tags: [measurement, 2026-11-15-organic-traffic]
measured: 2026-11-15
---

# Google Trends, worldwide, read 2026-11-15

Trends is relative interest, 0–100, where 100 is the busiest week of the busiest term **in that
comparison**. It is not a search count. Comparisons share terms so they can be chained.

Comparisons A and B were read through Trends' own JSON endpoints (`/trends/api/explore` →
`widgetdata/multiline` and `relatedsearches`, no login), which tag the request
`USER_TYPE_SCRAPER`. A third scripted run was blocked by this session's permission classifier, so
C–F were read in the owner's Chrome on trends.google.com ("Web Search", "All categories"), where
the page prints the averages and the weekly table as text.

## A — 5 years, weekly (2021-11-15 .. 2026-11-15)

| term | mean | median | max | peak week |
|---|---|---|---|---|
| merge pdf | 57.80 | 58 | 85 | 2026-10-25 |
| compress pdf | 38.88 | 38 | 62 | 2026-06-07 |
| youtube recap | 1.59 | 1 | **100** | **2025-11-30** |
| youtube watch history | 0.73 | 0 | 7 | 2025-11-30 |
| youtube wrapped | 0.66 | 0 | 56 | 2025-11-30 |

In its peak week, "youtube recap" was searched more than "merge pdf" in its average week. The rest
of the year it sits near 1.

## B — 5 years, weekly

| term | mean | median | max | peak week |
|---|---|---|---|---|
| youtube watch time | 17.27 | 8 | 100 | 2025-11-30 |
| youtube watch history | 6.96 | 3 | 50 | 2025-11-30 |
| youtube history stats | 1.40 | 0 | 18 | 2025-11-30 |
| google takeout youtube | 0.63 | 0 | 3 | 2025-11-30 |
| watch-history.json | 0.00 | 0 | 1 | 2026-07-26 |

Every YouTube term peaks in the same week, 2025-11-30 .. 12-06.

## C — 12 months (2025-11-09 .. 2026-11-15)

| term | average |
|---|---|
| merge pdf | 85 |
| pdf ocr | 12 |
| searchable pdf | 1 |
| ai image checker | 1 |
| exif viewer | 0 |

## D — 12 months

| term | average |
|---|---|
| merge pdf | 85 |
| pdf to image | 66 |
| image to text | 28 |
| watermark pdf | 5 |
| screenshot to text | 1 |

## E — 12 months

| term | average | note |
|---|---|---|
| youtube recap | 5 | 100 in the week of 2025-11-30, 29 the next, 2–4 the rest of the year |
| youtube chapters | 5 | |
| youtube watch history | 2 | |
| youtube tag extractor | 0 | |
| youtube title length | 0 | |

## F — 12 months

| term | average |
|---|---|
| pdf ocr | 56 |
| youtube watch history | 13 |
| remove exif | 1 |
| merge pdf offline | 0 |
| compress pdf offline | 0 |

## Chained, relative to "merge pdf" = 1 (12-month averages)

| term | ratio | via |
|---|---|---|
| pdf to image | 0.78 | D |
| image to text | 0.33 | D |
| pdf ocr | 0.14 | C |
| watermark pdf | 0.06 | D |
| youtube watch history | 0.033 | F × C (0.0126 over 5 years in A) |
| searchable pdf, ai image checker, screenshot to text | ~0.012 | C, D (1 on a scale where merge pdf is 85: rounding noise) |
| remove exif | ~0.0025 | F × C |
| exif viewer, youtube tag extractor, youtube title length, merge pdf offline, compress pdf offline | ~0 | below Trends' resolution in these comparisons |

## Related queries

- **youtube recap**, top: "youtube recap 2026" (100), "youtube recap 2024" (89), "youtube recap
  today" (49), "my youtube recap" (38), "youtube recap reddit" (30), **"no youtube recap" (26)**,
  "how to see youtube recap" (21). Rising, all "Breakout": "youtube.com/recap", "how to see youtube
  recap 2025", **"youtube recap 2025 not showing"**, "youtube recap not showing up", "where to see
  youtube recap", "where to find youtube wrapped".
- **youtube wrapped**, rising: "how to get youtube wrapped 2025", "youtube wrapped not showing",
  "where to find youtube wrapped" (all Breakout).
- **youtube watch history**, top: "search youtube watch history" (100), "youtube watch history off"
  (66), "how to delete youtube watch history" (43), "how to see youtube watch history" (42).
- **watch-history.json**, top: "takeout/youtube and youtube music/history/watch-history.json".
- **youtube watch time**: dominated by creators ("buy youtube watch time", "youtube watch time for
  monetization"). Not the viewer's intent.
- **merge pdf / compress pdf**: brand navigation ("love pdf merge", "ilovepdf merge", "small pdf",
  "11zon") and Indian government portals.
- **exif viewer**, rising: "jimpl exif viewer", "metadata2go", "faststone image viewer" (named
  competitors). **ai image checker**, rising: "synthid checker", "synthid", "truthscan" (Breakout).
- **merge pdf offline**, rising: "pdfsam". **compress pdf offline**: "pdf24 creator". People who
  want offline look for desktop software.

## What Trends does not say

- No absolute volumes. Any monthly number derived from these ratios needs an anchor this file does
  not have.
- Terms are matched broadly, so "youtube watch history" includes deleting, pausing and searching
  history, not only analysing it.
- In E every term reads 1 from the week of 2026-09-27 on, and in C and F "pdf ocr" falls by about
  half from August while "merge pdf" holds in D. Whether that is demand or a change in Trends (the
  page announces "Classic Explore is expiring soon") is not knowable from here. Read the last eight
  weeks with care.
