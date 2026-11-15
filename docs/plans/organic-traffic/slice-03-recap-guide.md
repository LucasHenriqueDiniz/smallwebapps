---
status: todo
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
