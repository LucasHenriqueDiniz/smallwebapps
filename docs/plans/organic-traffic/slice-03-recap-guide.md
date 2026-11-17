---
status: done
kanban:
---

# Slice 3 — One guide for the recap intents

## Delivers

A guide in `apps/web/src/data/guides.ts` for the three intents the official Recap leaves open
(`research.md`, finding 5):

| intent | queries seen (Trends related, SERP) | what the page answers |
|---|---|---|
| past years | "youtube recap 2024", "2023", "2022" | the official Recap is one year; the Takeout file holds every year; how to get it and read any year in slice 2's view |
| not showing | "no youtube recap", "youtube recap 2025 not showing", "youtube wrapped not showing" | the reasons YouTube itself gives, quoted and linked; what a Takeout recap can and cannot do for each (a paused history is missing from Takeout too) |
| all-time | "how much youtube have i watched all time", "…calculator" | all-time counts from the file; why no honest tool gives hours from Takeout |

The slug and title are chosen in this slice, around the past-years phrasing. A page aimed at
"youtube recap 2025" itself would sit under the official feature, which owns that result page.

Every statement about YouTube's Recap (when it launched, who is excluded, what it shows) links to
blog.youtube or support.google.com, fetched into `docs/research/2026-11-15-organic-traffic/fetches/`
on the day of writing. Today those are known only from snippets on the result page.

⚠️ **Owner**: request indexing for the new URL the day it deploys.

## Needs

Slice 2 live, because the guide links the year view and describes it.

## Tests

- `pnpm --dir apps/web run build`; the guide renders inside `<main>` with its FAQ matching its
  structured data, as every guide does.
- `node apps/web/scripts/scan-links.mjs` exit 0 on the build.

## Done when

```bash
U=https://smallwebapps.com/guides/<slug>/
curl -s -o /dev/null -w '%{http_code}\n' "$U"                                   # 200
curl -s "$U" | grep -c 'name="robots" content="noindex'                         # 0
curl -s https://smallwebapps.com/sitemap-0.xml | grep -c "<loc>$U</loc>"        # 1
```

- `200`, `0`, `1`.
- Inbound links from at least 3 cluster pages (`/apps/tubetrace/` and two YouTube guides), counted
  with the link-graph step of slice 5 against production.
- Every claim about the official Recap carries a link, and each linked page is saved in `fetches/`:
  claims N, linked N.
- Indexing requested (owner), with the date written into this slice.

**Calendar.** Live by 2026-11-22 gives it a chance at the week of 2026-11-30. If it ships later, it
still targets the past-years queries, which run all year. Write the actual ship date here: slice 7's
clock starts from it.

## If stuck

If YouTube's help page on Recap eligibility cannot be fetched, drop the "not showing" section rather
than restate it from a snippet.

## Progress

**2026-11-15: written and built. Waiting on merge, the production check and the owner's indexing request.**

- **Slug and title**: `/guides/youtube-recap-past-years/`, "How to See Your YouTube Recap for Past
  Years". It sits in the YouTube Analysis ring of `guides.ts`, last, so the ring links it from the three
  guides before it, and `guidesForTool("tubetrace")` links it from the tool page.
- **The fact the page is built on**: YouTube's help page says "Recaps will be automatically deleted for
  everyone after the end of the year". So no past-year Recap exists on YouTube, and a Takeout file is
  the only source for one. The same page puts the 2025 window at "January through late October", so
  November and December views were never in it.
- **Sources**, fetched today into `docs/research/2026-11-15-organic-traffic/fetches/`:
  `youtube-blog-introducing-recap-2025.md`, `youtube-help-find-share-recap.md`,
  `youtube-blog-find-share-save-recap.md`. Guide sections gained an optional `sources` list, rendered
  as links under the section.
- **"Not showing" section kept**: the eligibility page could be fetched (see "If stuck").
- The page dates its claims to the 2025 Recap, says the rules may change, and states no fact about a
  2026 Recap: none of the three sources has one.

Measured on the build (`apps/web/dist`):

| check | result |
|---|---|
| page | built, 1 `<main>`, 0 `noindex`, ~1,175 words in `<main>` |
| sitemap | lists it; 48 URLs (47 + 1) |
| inbound links | 4 cluster pages (`/apps/tubetrace/`, `what-your-youtube-history-reveals`, `pause-delete-youtube-history`, `youtube-takeout-json-vs-html`) + `/guides/`; the bar is ≥ 3 |
| claims about the official Recap | 10 distinct claims (launch date and rollout; what the cards show; the January–October window; no refresh, no recovery, deleted at year end; You tab until year end and card download; five eligibility rules), each in a section whose sources list its page: **10/10**; 3/3 pages saved in `fetches/`. The intro repeats the year-end deletion and links nothing; section 1 links it |
| structured data | Article + BreadcrumbList, as the other explainer guides |
| `scan-links.mjs` on `dist` | exit 0 |
| vitest / `astro check` / validators | 133/133 / 0 errors / 3 × exit 0 |

**Production, 2026-11-15** (PR #24, merged as `6f633bc` at 16:06 UTC, live about 270 s later): `200`,
`0` (no `noindex`), `1` (in the sitemap); sitemap 48 URLs.

**Indexing, 2026-11-16.** The guide was requested by `smallwebapps-pedir-indexacao`. Its run of
2026-11-16 15:32–15:42Z reports "Indexação solicitada" for the 6 sitemap URLs out of the index, this
one included. URL Inspection on 2026-11-17 12:34Z: **Submitted and indexed**, last crawl
2026-11-16T15:37Z, inside that run.

**Ship date, slice 7's day 0: 2026-11-15.**

- [x] Indexing requested (2026-11-16) and indexed (crawled 2026-11-16 15:37Z).
