# Plan — organic traffic

Pitch: `docs/pitches/organic-traffic.md`
Research: `docs/research/2026-11-15-organic-traffic/research.md`
Decision: 2026-11-15 in `docs/architecture/ARCHITECTURE.md`. It is proposed, and binds when the
owner merges this plan. The owner chose option A, 47 → 20 URLs, on 2026-11-15.

Seven slices. They are ordered by the calendar, not by size. Slices 2 and 3 are worth most if Google
has them before the "youtube recap" peak in the first week of December, so they come straight after
the ten-minute host fix. Slices 1, 4 and 5 do not depend on each other and can ship in any order.
Slice 7 is a wait on Google's clock.

| slice | delivers | done when, in one line |
|---|---|---|
| 1 — hosts | `www` answers 301 to the apex | done 2026-11-16: 20/20 sitemap paths (47 before slice 4) on `www` → one `301` to the same path and query on the apex |
| 2 — recap for any year | year picker and recap view in TubeTrace | for every year in the owner's real export, 4 figures equal `jq`: N/N years |
| 3 — recap guide | one guide for "past years", "not showing", "all-time" | live, indexable, in the sitemap, linked from ≥ 3 cluster pages, every claim about YouTube's Recap linked to YouTube's own page |
| 4 — narrow the index | option A: 21 tools and 4 guides cut, 3 merges | sitemap = 20 URLs; cut URLs `noindex` N/N; merges one `301` 3/3; `scan-links` exit 0 |
| 5 — links to the cluster | header, footer, home and related links lead to TubeTrace and the guides | `/apps/tubetrace/` inbound from 19/19 other indexable pages; every YouTube guide ≥ 10; 0 broken |
| 6 — re-earn the dropped guides | export how-to and `watch-history.json` reference checked against the live Takeout | owner follows the page and gets the file: pass; field table N/N against a real export; indexing requested |
| 7 — gate | the next decision, from Google's numbers | decision written with day-28 index state and day-42 impressions and clicks for the 8 cluster URLs |

**Baseline, 2026-11-15** (`docs/research/2026-11-15-organic-traffic/measurements/`): 33 of 47
sitemap URLs indexed; 0 clicks and 25 impressions in the last 28 days; cluster URLs indexed 4 of 7;
`www` 0/47; `/apps/tubetrace/` 14 inbound links.

**Owner actions.** Each is marked ⚠️ in its slice:
- request a YouTube Takeout export now, because it can take days (slice 2);
- the `www` DNS record and Redirect Rule (slice 1);
- follow the export guide on the live Takeout screens (slice 6);
- "Request indexing" for each new or reworked URL, and widen `smallwebapps-pedir-indexacao` to
  guides and to the kept set only (slices 3, 4, 6);
- approve the decision the gate writes (slice 7).

**Rules every slice keeps:**
- no page aimed at "youtube watch history analyzer" or "stats". Three exact-match domains own them;
- no figure that Takeout does not contain. Views have timestamps, not durations;
- a page is linked if and only if it is indexable, for tools (2026-10-18) and now for guides;
- each done criterion compares against something other than our own code: `jq`, `curl`, the live
  Takeout screens, Google's own API.

Out of scope for all seven, per the pitch: any PDF, image or creator-tool work; deleting anything;
the AdSense review; the items in `docs/IDEAS.md`.
