---
tags: [measurement, 2026-11-15-organic-traffic]
measured: 2026-11-15
---

# URL Inspection, the 47 sitemap URLs, 2026-11-15

`sitestats inspect smallwebapps --file <the 47 <loc> of sitemap-0.xml> --json`, raw output in
`url-inspection-2026-11-15.json`. Compared with the same 47 URLs on 2026-10-18
(`docs/research/2026-10-18-adsense-low-value-review/url-inspection-2026-10-18.json`). Indexing was
requested for the `/apps/` pages not yet indexed on 2026-10-22..24.

| coverage | 2026-10-18 | 2026-11-15 |
|---|---|---|
| Submitted and indexed | 14 | **33** |
| Crawled – currently not indexed | 7 | 3 |
| Discovered – currently not indexed | 22 | 5 |
| URL is unknown to Google | 4 | 6 |

All 33 indexed URLs: `googleCanonical` equals the declared canonical, robots allowed, fetch
successful, crawled as mobile.

## Not indexed today (14)

| URL | 2026-10-18 | 2026-11-15 | last crawl |
|---|---|---|---|
| `/apps/image-format-converter/` | Crawled | Crawled – not indexed | 2026-10-27 |
| `/apps/pdf-extract-text/` | unknown | Discovered | — |
| `/apps/pdf-ocr/` | Discovered | Discovered | — |
| `/apps/pdf-split/` | unknown | Discovered | — |
| `/apps/pdf-merge/` | Discovered | **unknown** | — |
| `/apps/pdf-metadata/` | Discovered | **unknown** | — |
| `/apps/pdf-rotate/` | Discovered | **unknown** | — |
| `/apps/pdf-to-image/` | Discovered | **unknown** | — |
| `/apps/searchable-pdf/` | Discovered | **unknown** | — |
| `/guides/how-to-export-youtube-watch-history/` | **indexed** | **Crawled – not indexed** | 2026-10-19 |
| `/guides/how-to-analyze-youtube-watch-history/` | Crawled | Crawled – not indexed | 2026-09-04 |
| `/guides/browser-based-pdf-tools-safe-and-fast/` | Discovered | Discovered | — |
| `/guides/why-youtube-watch-counts-differ/` | Discovered | Discovered | — |
| `/guides/youtube-watch-history-json-format/` | Discovered | **unknown** | — |

Three things in this table:

1. **Eight of the ten PDF tool pages are out, and five of them went backwards.** Google had
   `pdf-merge`, `pdf-metadata`, `pdf-rotate`, `pdf-to-image` and `searchable-pdf` queued as
   Discovered on 2026-10-18. Four weeks later, after the indexing requests, it reports them as never
   seen. Every one is in the sitemap, and `pdf-merge` and `pdf-metadata` are linked from the footer
   of all 47 pages (`internal-links-2026-11-15.md`). Links are not what is missing.
2. **The guide that drew impressions was dropped.** `/guides/how-to-export-youtube-watch-history/`
   was indexed on 2026-10-18 and had 16 impressions in 90 days. Google crawled it on 2026-10-19 and
   now declines it. `/guides/how-to-analyze-youtube-watch-history/` (6 impressions) has been declined
   since its last crawl on 2026-09-04. Both are about the one subject the site has queries for.
3. **19 URLs were added to the index between the two readings**, mostly image tools, YouTube creator
   tools and the legal pages. In the 28 days to 2026-11-13 they drew, between them, 4 impressions on
   `/apps/image-crop/` and 13 on `/about/`, `/contact/` and `/privacy/`
   (`search-console-2026-11-15.md`). The API does not give the date a URL entered the index, and
   several were last crawled in November, so some have had under three weeks. Still, 15 of the 19
   drew no impression at all in those 28 days.

The daily task `smallwebapps-pedir-indexacao` (enabled, last run 2026-11-03, next 2026-11-15) asks
for indexing of `/apps/` pages only. The five guides out of the index are outside its scope.

`how-to-analyze-youtube-watch-history` is the only URL whose declared canonical differs from
Google's: it was crawled on 2026-09-04, when the canonical had no trailing slash. Today's HTML
declares the slashed URL, so this is a stale crawl, not a live conflict.
