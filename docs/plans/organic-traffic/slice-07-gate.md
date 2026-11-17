---
status: todo
kanban:
---

# Slice 7 — Gate: Google's numbers decide what comes next

## Delivers

A dated decision in `docs/architecture/ARCHITECTURE.md`, written from Google's numbers for the
**8 cluster URLs**: `/apps/tubetrace/`, the recap guide (slice 3), and the six YouTube guides kept
in slice 4.

**Clock.** Day 0 is the date slice 3 deploys, written in slice 3. Day 28 is the index reading. Day 42
is the impressions reading, over days 14–42, so that the first two weeks of crawling do not count
against the pages.

| reading | command | bar |
|---|---|---|
| day 28 | `sitestats inspect smallwebapps <8 URLs>` | ≥ 7 of 8 "Submitted and indexed" |
| day 42 | `sitestats gsc smallwebapps --dim page --start <day 14> --end <day 42>`, summed over the 8 URLs | impressions and clicks, below |

**Baseline, 2026-11-15:** 4 of 7 existing cluster URLs indexed (`tubetrace`, `pause-delete`,
`what-reveals`, `json-vs-html`). The best 28 days so far were about 90 impressions
(`/apps/tubetrace/`, 2026-09-07..10-04). Clicks in the site's whole history: 1.

| day 42 result | decision |
|---|---|
| ≥ 150 impressions **and** ≥ 5 clicks | **build on it**: the next Takeout question in `docs/IDEAS.md`, one page at a time, same gate |
| 30–149 impressions, or fewer than 5 clicks | **hold**: no new pages; re-read at day 70 |
| < 30 impressions | **stop adding pages**. Google is not showing the cluster at all, which points to a site-level judgement. The decision records that, and what would reopen it |

Also in the decision:
- `sitestats gsc smallwebapps --dim page,query` for the same window, split into recap queries
  (containing "recap" or "wrapped") and the rest. A December spike must not pass for steady demand.
- **The click count that will trigger the AdSense review.** PR #19 left it as "real clicks", with no
  number. The gate proposes one, from what the 42 days actually show, and the owner sets it.
- The two hosts from slice 1 in Search Console's crawl stats: `www` showing 301s, not DNS errors.

## Needs

Slices 3, 4 and 6 deployed and their dates written down. All three are:
- slice 3 shipped on 2026-11-15;
- slice 4 shipped on 2026-11-15;
- slice 6 shipped on 2026-11-15 and was reworked on 2026-11-17.

**Calendar** (day 0 = 2026-11-15, the recap guide's ship date):

| day | date | reading |
|---|---|---|
| 14 | 2026-11-29 | start of the impressions window |
| 28 | 2026-12-13 | index state of the 8 URLs |
| 42 | 2026-12-27 | end of the window; read on 2026-12-30 or later, for Search Console's lag |
| 70 | 2027-01-24 | second reading, only if day 42 selects "hold" |

**Reading of 2026-11-17** (day 2, URL Inspection at 12:34Z): **5 of 8** indexed. These are
`tubetrace`, `youtube-recap-past-years` (new, crawled 2026-11-16), `json-vs-html`, `what-reveals` and
`pause-delete`. The three out of the index:
- `how-to-export` is "Crawled - currently not indexed", last crawl 2026-10-19, before both rewrites;
- `json-format` and `counts-differ` are "Discovered - currently not indexed".

## Tests

None: this slice reads, it does not change code.

## Done when

The decision is merged with the owner's approval and contains: the 8 URLs with their coverage state at
day 28 (N of 8), the day-14–42 impressions and clicks per URL and in total, the recap/non-recap split,
the row of the table above that the totals select, and the AdSense click number.

⚠️ **Owner**: approve the decision. A scheduled task can produce the readings and open the docs PR
(as calculebrasil's `pilot-gate-day28/day42` do). It does not merge.

## If stuck

If Search Console data for the window is still moving (the 2-day lag), read again three days later.
Do not move the window.
