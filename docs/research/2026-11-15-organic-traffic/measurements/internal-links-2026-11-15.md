---
tags: [measurement, 2026-11-15-organic-traffic]
measured: 2026-11-15
---

# Internal links between the 47 sitemap pages, production, 2026-11-15

Each `<loc>` of `https://smallwebapps.com/sitemap-0.xml` fetched with `curl` (Cloudflare answers
`403` to Python's default user agent, so the fetch is curl and the parsing is Python). Every
`href` starting with `/` or `https://smallwebapps.com/` is counted once per page; "in" is the
number of *other* sitemap pages that link to the URL, "depth" the clicks from `/`.

## Sitewide links decide who gets linked

The header and footer link the same 12 tools from every page (46 in each). Which 12 has nothing to
do with demand: the footer shows the first four listed tools of each category.

| in | depth | URL |
|---|---|---|
| 46 | 1 | `/apps/ai-image-checker/`, `/apps/exif-viewer/`, `/apps/image-crop/`, `/apps/image-grayscale/` |
| 46 | 1 | `/apps/image-to-pdf/`, `/apps/pdf-compress/`, `/apps/pdf-merge/`, `/apps/pdf-metadata/` |
| 46 | 1 | `/apps/youtube-chapter-generator/`, `/apps/youtube-description-cleaner/`, `/apps/youtube-tag-extractor/`, `/apps/youtube-title-counter/` |
| 46 | 1 | `/`, `/about/`, `/apps/`, `/guides/`, `/contact/`, `/privacy/`, `/terms/` |
| **14** | 1 | **`/apps/tubetrace/`** |
| 11 | 2 | `/apps/pdf-ocr/` |
| 11 | 1 | `/apps/image-resize/` |
| 9 | 2 | `/apps/image-metadata/` |
| 7–8 | 1 | `/apps/image-optimize/`, `/apps/pdf-split/`, `/apps/image-to-text/`, `/apps/pdf-to-image/` |
| 5–6 | 2 | 7 tools and 7 YouTube guides |
| 3–4 | 2 | `/guides/csv-cleaning-before-import/`, `/guides/json-formatting-and-validation/`, `/guides/resize-compress-images-locally/` |

- The one page with search impressions, `/apps/tubetrace/` (154 of 198 in 90 days), has **14**
  inbound links. `pdf-merge` and `pdf-metadata`, which Google reports as never seen, have **46**.
- Every YouTube watch-history guide has 5–6 inbound links and sits two clicks from `/`.
- No sitemap page is orphaned, and none is deeper than two clicks.
- One broken link: `/guides/privacy-first-file-tools-local-processing/` has a "Browse all tools"
  button to `/apps//`.
