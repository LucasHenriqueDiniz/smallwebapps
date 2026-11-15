---
tags: [research, seo, organic-traffic]
date: 2026-11-15
status: done
---

# Organic traffic: why the indexed pages are not shown, and what the site can rank for

Three questions block a plan for search traffic to smallwebapps.com:

1. 33 of 47 sitemap URLs are indexed. Why do they earn almost no impressions?
2. Which queries can each of the 28 tools realistically rank for, and which tools should be cut or
   merged because they are low value against strong competitors?
3. How does `www.smallwebapps.com`, which does not resolve, get a 301 to the apex?

Every number below comes from a file in `measurements/` or `fetches/`. Anything derived from those
numbers by arithmetic is marked **ESTIMATE** and says how it was derived.

## Verdict

1. **The site is indexed for queries nobody can win and absent from the ones it could.** 22 of the
   28 indexable tools are PDF and image operations. Google declines most of them: 8 of the 10 PDF
   tools are out of the index, 5 of them went backwards from "Discovered" to "unknown" in four
   weeks, and the 12 image tools drew 14 impressions in 90 days between them. The one subject with
   impressions is YouTube Takeout: `/apps/tubetrace/` drew 154 of the site's 198 impressions in 90
   days, at position 7.2. That page lost them in the week of 2026-10-19, and in the same week Google
   dropped the export guide, which had drawn 16 impressions, from the index. The cause of that drop is not
   established.
2. **Invest in the YouTube Takeout cluster and narrow the index to it.** It is the only cluster
   with measured impressions, with openings on page one (forums, GitHub, small blogs) and with an
   unserved angle. Since 2025-12-02 YouTube has run its own yearly Recap. It covers only the
   current year, and people search for the years before it and for why their Recap does not show.
   Those searches peak in the first week of December and only a Takeout file can answer them. Cut
   the PDF, image-editing and creator tools from the index (`noindex`, unlisted, still served), as
   on 2026-10-18. Merge three overlapping pages behind 301s. Keep the OCR and EXIF tools indexed
   without new work.
3. **`www`: a proxied AAAA `100::` record plus a Redirect Rule** `http*://www.smallwebapps.com/*`
   → `https://smallwebapps.com/${2}`, 301, query preserved. tglinks and calculebrasil did the same
   thing on 2026-11-13 and 2026-11-14.

## Findings

### 1. Indexed is not shown: 20 of 33 indexed URLs earned nothing in 28 days

`measurements/search-console-2026-11-15.md`, `measurements/url-inspection-2026-11-15.md`

| | 2026-10-18 | 2026-11-15 |
|---|---|---|
| sitemap URLs indexed | 14 / 47 | 33 / 47 |
| impressions, previous 28 days | 96 (2026-09-19 .. 10-16) | 25 (2026-10-17 .. 11-13) |
| clicks, previous 28 days | 0 | 0 |

Indexing more than doubled, and impressions fell by three quarters. In the last 28 days 13 URLs
had any impression. Of the 28 tool pages, three did: `/apps/tubetrace/` 18, `/apps/image-crop/` 4
and `/apps/image-resize/` 4. Of the 19 URLs that entered the index between the readings, 15 drew no
impression at all. Some have been indexed for under three weeks, so this is early. It is consistent
with the 90-day record: the 12 image tools drew 14 impressions between them (image-resize 7,
image-crop 4, image-to-pdf 3) and the 10 PDF tools 5.

### 2. Google is turning the PDF tools down, and links are not why

Eight of the ten PDF tool pages are out of the index. `pdf-merge`, `pdf-metadata`, `pdf-rotate`,
`pdf-to-image` and `searchable-pdf` were "Discovered" on 2026-10-18 and are "URL is unknown to
Google" on 2026-11-15, after the indexing requests of 2026-10-22..24. `pdf-merge` and
`pdf-metadata` are linked from the footer of all 47 pages (`measurements/internal-links-2026-11-15.md`).
Google knows where they are and is choosing not to crawl them.

The demand behind them is real and is not available. "merge pdf" is about **165,000 searches a
month in the US** (WordStream, a grouped Keyword Planner-style estimate, `fetches/wordstream-keyword-tool.md`)
and ">100K" with keyword difficulty "Hard" in Ahrefs (`fetches/ahrefs-keyword-generator.md`). Every
"merge pdf" variant Ahrefs scores is Hard or Medium. Trends' related queries for "merge pdf" and
"compress pdf" are brand navigation: "love pdf merge", "ilovepdf merge", "small pdf", "11zon". The
site's angle, processing without uploading, has no measurable demand: "merge pdf offline" and
"compress pdf offline" read 0 against "pdf ocr" at 56, and their related queries are desktop
software ("pdfsam", "pdf24 creator") (`measurements/google-trends-2026-11-15.md`, comparison F).

Google's own guidance on site-wide quality: "check if your site overall (not just individual pages)
is delivering content that's helpful", and "deleting the unhelpful content can help the good
content on your site perform better", deletion being "a last resort"
(`../2026-10-18-adsense-low-value-review/fetches/search-core-updates.md`). `noindex` does the same
job in Search and stays reversible, which is how the 114 were handled on 2026-10-18.

### 3. The one cluster with impressions is YouTube Takeout, and it fell in the week of 2026-10-19

`/apps/tubetrace/` by week: 21, 17, 27, 25, 22, 14 from 2026-09-07 to 2026-10-12, then 5, 1, 2, 5.
Through September and October the impressions were US (144 of 193 in 90 days, at position 5.1) and
desktop (187 of 193), from queries Google withholds as rare. The queries it does show for the page,
"watch-history.json" and "google takeout youtube history", sat at 48–64.

Two events share the week of the drop, and the data cannot separate them:

- **PR #18 deployed on 2026-10-18.** The home page, header, footer and related links changed, and
  12 size variants became 301s. The TubeTrace page's own title, description and canonical did not
  change (`git diff 8f6b5d9 a996992 -- apps/web/src/data/apps.ts` touches no TubeTrace field).
- **Google re-judged the cluster.** It crawled `/guides/how-to-export-youtube-watch-history/` on
  2026-10-19 and dropped it from the index. Four of the seven YouTube guides are now out:
  how-to-export and how-to-analyze are "Crawled – currently not indexed", why-youtube-watch-counts-differ
  is "Discovered", and youtube-watch-history-json-format is "unknown".

Ruled out as the reason the guides are declined: **duplicate text.** Pairwise 5-gram Jaccard
similarity between the TubeTrace page and the seven YouTube guides is at most 0.059 (median 0.042)
on 2026-11-15, measured on production HTML inside `<main>`. The guides overlap in topic, not in
wording. how-to-analyze covers what the TubeTrace page itself covers in 1,853 words, and it has been
declined since 2026-09-04.

Not ruled out: **the impressions were never people.** 0 clicks on 144 US impressions at an average
position of 5.1, 97% desktop, is unusual for human searches. Rank trackers that load result pages
would produce exactly this. So would a page sitting below an AI Overview and video blocks, which is
what every one of the ten result pages read today looked like (`measurements/serp-us-2026-11-15.md`).
Either way, **the site has never had a measured human visitor from Search**: 1 click in its history,
on 2026-06.

### 4. Internal links go where the alphabet sends them

The footer lists the first four tools of each category, so `pdf-merge`, `pdf-metadata`,
`youtube-title-counter` and nine others have 46 inbound links each, from every page. `/apps/tubetrace/`
has 14. Every YouTube guide has 5–6 and sits two clicks from `/`. One link is broken:
`/guides/privacy-first-file-tools-local-processing/` points "Browse all tools" at `/apps//`
(`measurements/internal-links-2026-11-15.md`).

Links did not get the PDF pages indexed (finding 2), so links alone are not the lever. They are the
signal the site sends about which pages matter, and today it points away from the one cluster that
has impressions.

### 5. The Takeout cluster has openings, competitors and a December spike

`measurements/serp-us-2026-11-15.md` (Google, `hl=en&gl=us&pws=0`, one reading each). All ten result
pages had an AI Overview, and smallwebapps.com was on none of them.

| query | page one | opening |
|---|---|---|
| export youtube watch history | Reddit, a 2016 Stack Exchange thread, Google, GitHub, two small sites | **yes**: no strong current guide |
| youtube takeout json vs html | a backup article, GitHub issue, support threads; AI Overview built from two small sites | **yes**, low volume |
| watch-history.json | small analyzer sites, GitHub, Reddit; AI Overview names analyzers | **yes**, crowded |
| youtube watch history analyzer / stats | 3 exact-match single-tool domains hold 1–3 (youtubewatchhistoryanalysis.com, playbackstats.com, youtubewatchhistorystats.com) | contested |
| google takeout youtube watch history | Google #1 and #3, small analyzers at 4, 5, 8 | weak |
| how much time have i spent on youtube | AI Overview: YouTube gives no all-time total; #1 is a Reddit thread asking for one | weak, but an **unserved sub-intent** |
| youtube wrapped | YouTube's own Recap takes 3 slots; viewodyssey #2, TubeWrapped #7, 10015.io #8 | weak, seasonal |
| youtube recap 2025 | navigational to youtube.com/recap | no |
| youtube tag extractor | nine dedicated tools including vidIQ and Keywords Everywhere | **no** |

**YouTube's Recap changes the cluster.** The official Recap was announced on blog.youtube on
2025-12-02 and is built from watch history. Its result pages now lead "youtube wrapped" and "youtube
recap". The year-round demand did not move, but the peak did. Every YouTube term in Trends peaks in
the week of 2025-11-30: "youtube recap" goes from about 1 to 100. In that week it was searched more
than "merge pdf" in an average week (comparison A). Its related queries show what the official
Recap leaves open:

- **past years**: "youtube recap 2024" (89), "youtube recap 2023" (53), "youtube recap 2022" (53).
  The official Recap shows one year. A Takeout file holds every year since the account began.
- **not showing**: "no youtube recap" (26), and "youtube recap 2025 not showing", "youtube recap
  not showing up", "youtube wrapped not showing", all Breakout. Per the AI Overview, supervised
  accounts and users under the age of consent get no Recap at all.
- **all-time**: "how much youtube have i watched all time" and "how much time have i spent on
  youtube calculator" are related searches. Takeout records a timestamp per view, not a duration,
  so any time total is an estimate and has to say so.

The peak is two weeks away. A page shipped and submitted around 2026-11-22 may not be indexed by
2026-11-30. The `/apps/` pages requested on 2026-10-22..24 that are indexed now were last crawled
between 2026-10-22 and 2026-11-15, most of them 2026-11-02..09, one to two and a half weeks later.

### 6. Volume, per tool

Anchors, US monthly, from vendors: "merge pdf" **165,000** (WordStream, grouped); "youtube watch
history" **8,100** (WordStream, grouped with "see youtube history" and similar) and ">1000"
(Ahrefs); "google takeout youtube watch history" "<100" (Ahrefs), "No Results" (WordStream). Semrush
was gated behind registration.

The chained Trends ratios are worldwide and the anchor is US, so every row below is an
**ESTIMATE**, low confidence, good for order of magnitude only: Trends ratio × 165,000.

| term | Trends ratio to "merge pdf" | **ESTIMATE**, US searches / month |
|---|---|---|
| pdf to image | 0.78 | ~130,000 |
| compress pdf | 0.67 (5-year A) | ~110,000 |
| image to text | 0.33 | ~54,000 |
| pdf ocr | 0.14 | ~23,000 |
| watermark pdf | 0.06 | ~10,000 |
| youtube watch history | 0.033 (0.013 over 5 years) | ~2,000–5,500; vendor says 8,100 for the group |
| searchable pdf, ai image checker, screenshot to text | ~0.012 (Trends' floor) | ~2,000 or less |
| remove exif | ~0.0025 | ~400 |
| exif viewer, youtube tag extractor, youtube title length, merge pdf offline, compress pdf offline | ~0 | below Trends' resolution |
| youtube recap, peak week | 100 in A vs "merge pdf" mean 57.8 | **ESTIMATE**: ~65,000 in that one week (165,000 × 12 ÷ 52 × 100 ÷ 57.8), worldwide and US mixed |

One measured floor, not an estimate: in September and October `/apps/tubetrace/` was shown about 20
times a week at position ~5 for the queries Google withholds. Whatever those queries were, they ran
at least ~90 times a month.

The volumes do not change the verdict. The large rows belong to queries with brand-navigation SERPs
and "Hard" difficulty, where the site is not indexed. The small rows belong to the cluster where it
was shown.

### 7. Per-tool verdict

"SERP" is the 2026-11-15 reading. Queries 11–22 (chapter generator, title limit and every
PDF/image/OCR query) were **not read**: Google answered with its "unusual traffic" page and the
CAPTCHA was not solved. For those tools the verdict rests on Search Console, URL Inspection and
Trends.

| tool | index 11-15 | impressions 90 d | demand (finding 6) | competition | verdict |
|---|---|---|---|---|---|
| tubetrace | indexed | 154 | ~2–8K group, + recap peak | 3 exact-match tools; openings on export/format/recap | **invest** |
| youtube-tag-extractor | indexed | 5 | ~0 | vidIQ and 8 dedicated tools (SERP) | **cut** |
| youtube-chapter-generator | indexed | 0 | "youtube chapters" is the feature, not a tool | SERP not read | **cut** |
| youtube-title-counter | indexed | 0 | ~0 | SERP not read | **cut** |
| youtube-description-cleaner | indexed | 0 | not measured | SERP not read | **cut** |
| youtube-url-parser | indexed | 1 (position 76) | not measured | SERP not read | **cut** |
| pdf-compress | indexed | 3 | ~110K, brand navigation | iLovePDF, Smallpdf, 11zon (Trends related) | **cut** |
| pdf-merge | unknown | 0 | ~165K, KD Hard | same | **cut** |
| pdf-split, pdf-rotate, pdf-to-image | out | 0 | large, commodity | same | **cut** |
| pdf-watermark | indexed | 2 | ~10K | SERP not read | **cut** |
| pdf-metadata | unknown | 0 | not measured | SERP not read | **cut** |
| pdf-extract-text | discovered | 0 | not measured | SERP not read | **cut** |
| pdf-ocr | discovered | 0 | ~23K; rising queries are developer libraries | SERP not read | **keep**, no new work |
| searchable-pdf | unknown | 0 | ~2K or less | SERP not read | **keep**, no new work |
| image-to-text | indexed | 0 | ~54K | SERP not read | **keep**, no new work |
| screenshot-to-text | indexed | 0 | ~2K or less | same OCR engine as image-to-text | **merge** → image-to-text |
| exif-viewer | indexed | 0 | ~0; competitors jimpl, metadata2go named in Trends | SERP not read | **keep**, no new work |
| image-metadata | indexed | 0 | — | overlaps exif-viewer | **merge** → exif-viewer |
| ai-image-checker | indexed | 0 | ~2K or less; rising "synthid checker", "truthscan" | Google's own SynthID detector rising | **cut**: heuristic-only, probabilistic |
| image-resize, image-crop | indexed | 7, 4 | commodity | SERP not read | **cut** |
| image-optimize, image-flip-rotate, image-grayscale, image-to-pdf | indexed | 0–3 | commodity | SERP not read | **cut** |
| image-format-converter | crawled, not indexed | 0 | commodity | SERP not read | **cut** |

The OCR and EXIF tools are kept because they share the cluster's privacy argument (scanned IDs,
location in a photo) and nothing measured says they hurt. Nothing measured says they help either;
they get no work until a later gate says otherwise.

Guides follow their tools. `csv-cleaning-before-import` and `json-formatting-and-validation` explain
tools noindexed since 2026-10-18, and `resize-compress-images-locally` and
`browser-based-pdf-tools-safe-and-fast` explain tools cut here: **cut**. `how-to-analyze-youtube-watch-history`
repeats the TubeTrace page and has been declined since September: **merge** → `/apps/tubetrace/`.
The other six YouTube guides and `privacy-first-file-tools-local-processing` stay.

Result, if the owner takes the whole table: 7 static pages + 5 tools + 7 guides = **19 indexable
URLs**, against 47 today.

### 8. `www` and `pages.dev`

`measurements/hosts-2026-11-15.md`, `fetches/cloudflare-*.md`

- `www.smallwebapps.com` has no A, AAAA or CNAME record. Cloudflare's example redirects
  `https://www.*` to `https://${1}`, 301, query preserved, and says nothing about DNS. The sibling
  sites needed a proxied placeholder record (AAAA `100::`). They also found that the example's
  `https://` pattern sends `http://www` through two hops, and widened it to `http*://`.
- `smallwebapps.pages.dev` serves the whole site with a 200 and a canonical pointing at the apex.
  Cloudflare documents a Bulk Redirect for it. The page ticks "Include subdomains", which by its
  name would also catch the `<hash>.smallwebapps.pages.dev` PR previews, and it does not discuss
  previews at all. Optional, and only with previews checked afterwards.

## The strongest case against this verdict

**Cutting 28 URLs could make things worse.** The site would go from a "small web apps" hub to
roughly one tool plus guides. That is fewer pages for AdSense to judge and fewer chances to rank,
and image-resize and image-crop are two of the three tools with any impression in the last 28 days.
Counter: those are 11 impressions in 90 days, 0 clicks. Google is declining the PDF pages on its
own. And the move is a one-line revert per slug in `indexing.ts`, as it was on 2026-10-18. The plan
therefore cuts in one deploy and measures the cluster before and after. It does not claim the cut
alone will raise anything.

**The cluster's impressions may have been bots all along** (finding 3). If so, the only "signal"
behind the investment is page-one structure and Trends. Neither proves people will click a
smallwebapps.com result. That is why the plan has a gate with a click count, not only impressions.

**Three exact-match domains already serve "analyzer" and "stats".** A multi-tool domain is unlikely
to pass them on those two queries. The plan therefore does not target them. It goes for the
intents they do not serve: past-year recap, "not showing", the export how-to, the file-format
reference.

## What this does not establish

- **Why `/apps/tubetrace/` and the export guide fell in the week of 2026-10-19.** The PR #18 deploy
  and a Google re-crawl share the week. No test here separates them.
  One cheap test was not run: build `8f6b5d9`, the commit before PR #18, and count inbound links to
  `/apps/tubetrace/` with the same link graph. It is in `docs/IDEAS.md`.
- **Whether the impressions were human.** Search Console cannot tell.
- **The PDF, image and OCR result pages.** They were not read. The cut does not depend on them,
  because Google's own index verdict is the evidence. A reader who wants to bring an OCR tool into
  scope has to read those pages first.
- **Absolute volumes.** Only three vendor numbers exist, and all are grouped estimates or ranges.
- **Whether the official 2026 Recap is live yet.** youtube.com/recap's snippet says "Looking for your
  2026 Recap?" with no date.

## Sources

- `measurements/search-console-2026-11-15.md`: GSC totals, pages, queries, weekly series, country, device
- `measurements/url-inspection-2026-11-15.md` and `.json`: index state of the 47 URLs, compared with 2026-10-18
- `measurements/internal-links-2026-11-15.md`: inbound links and click depth on production
- `measurements/google-trends-2026-11-15.md`: six comparisons, related queries
- `measurements/serp-us-2026-11-15.md`: ten Google result pages, one reading each; stopped at query 11
- `measurements/hosts-2026-11-15.md`: DNS and curl for apex, www, pages.dev
- `fetches/wordstream-keyword-tool.md`, `fetches/ahrefs-keyword-generator.md`, `fetches/semrush-keyword-overview.md`: volume sources (Semrush gated)
- `fetches/cloudflare-redirect-www-to-root.md`, `fetches/cloudflare-pages-redirect-to-custom-domain.md`
- `../2026-10-18-adsense-low-value-review/fetches/search-core-updates.md`: Google on site-wide quality and removing unhelpful content
- 5-gram similarity of the YouTube cluster: computed in this session on the production HTML fetched for `internal-links-2026-11-15.md`, script not kept; rerun by extracting `<main>` text and comparing word 5-grams
