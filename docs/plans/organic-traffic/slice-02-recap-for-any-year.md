---
status: doing
kanban:
---

# Slice 2 — A recap for any year, in TubeTrace

## Delivers

On `/apps/tubetrace/`, after a file is read: a year picker listing every year in the export, and for
the chosen year a recap of figures the file actually contains:

- videos watched, and distinct channels;
- top 5 channels, with counts;
- most rewatched videos (same `titleUrl` more than once);
- busiest month, weekday and hour;
- the first video of the year.

YouTube's own Recap (blog.youtube, 2025-12-02) covers one year and not every account. This covers
every year in the file. Related searches show demand for exactly that: "youtube recap 2024", "2023",
"2022", "not showing" (`measurements/google-trends-2026-11-15.md`).

**No watch time.** `watch-history.json` has a timestamp per view and no duration. The recap shows
counts and says, in one visible line, why there are no hours. "Hours watched" goes to
`docs/IDEAS.md`.

**One counting rule, stated on the page.** Today the parser counts every entry whose title starts
with "Watched ", which includes ads ("From Google Ads" in `details`). The recap excludes ads. It
counts YouTube and YouTube Music together, and says so. The rule matches what
`/guides/why-youtube-watch-counts-differ/` explains. If the guide and the code disagree, fix the
guide in this slice.

Years are cut in the browser's local time, as the existing hour and month charts already are.

## Needs

- ⚠️ **Owner**: a real Takeout export of YouTube watch history, JSON format. Request it now at
  takeout.google.com: delivery can take hours to days. The file stays on the owner's machine and is
  never committed. The test reads it from a path outside the repo.

## Tests

- **Unit (vitest)**: the per-year aggregation is a pure function next to the component, taking
  parsed entries and a time zone. Cases: an ad entry is excluded; an entry at `01-01T02:30Z` falls in
  the previous year in `America/Sao_Paulo` and in its own year in UTC; a video watched twice is a
  rewatch; an empty year is not offered. Revert check: drop the ad filter, and the ad case goes red.
- `pnpm --dir apps/web run build`, `test`, and the three `.claude/skills/*-validator.sh`.

## Done when

The oracle is `jq` over the owner's real file, in the same time zone as the browser that ran the page
(checked on 2026-11-15 against a 4-entry sample: the `02:30Z` entry moved to the previous year, the
ad was dropped):

```bash
TZ=America/Sao_Paulo jq -r -f apps/web/scripts/recap-oracle.jq \
  ~/Downloads/Takeout/YouTube*/history/watch-history.json
jq -c '[.[] | .details[]?.name] | group_by(.) | map({(.[0]): length}) | add' \
  ~/Downloads/Takeout/YouTube*/history/watch-history.json   # what `details` really holds
jq -r '[.[] | .title // "" | split(" ")[0]] | group_by(.) | map("\(.[0]) \(length)") | .[]' \
  ~/Downloads/Takeout/YouTube*/history/watch-history.json   # title prefixes: is the file in English?
```

Then open the deployed preview of this PR, load the same file, and for each year copy the page's four
figures beside `jq`'s line.

- **N/N years match** on videos, channels and the top-5 list (names and counts), where N is the
  number of years in the file. Report N and the file's entry count.
- Any mismatch is either a bug or a rule the page did not state. Fix it; never adjust `jq` to agree.
- Revert check: on a build without the ad filter, at least one year's video count differs from
  `jq`, unless the file has no ads. If it has none, say so.
- The page with JavaScript off still states what the recap shows and why there are no hours (the
  tool page contract in `CLAUDE.md`).

## If stuck

If the Takeout export has not arrived when the code is ready, ship behind the unit tests and run the
N/N check the day it arrives. The slice stays `doing` until then.

## Progress

**2026-11-15: built, and checked against a synthetic export. The real-file check is still open.**

What changed:
- `apps/web/src/tools/tubetrace/history.ts` (pure): JSON parsing moved out of the component. An entry
  counts when any of three signs says it is a watch event: title "Watched ", activityControls "YouTube
  watch history", or a link to a YouTube video. The link is the sign that does not depend on the
  account's language. Entries whose `details` read "From Google Ads" are dropped, in the totals too.
  The HTML reader drops an entry whose `.outer-cell` contains the same marker. That HTML behaviour is
  not tested: no real HTML export was available.
- `apps/web/src/tools/tubetrace/recap.ts` (pure): years, months, weekdays and hours in a given IANA
  zone (the browser's own on the page). A rewatched video is named by its most recent title.
- The component: year buttons (newest first, only years with views), and for the chosen year: videos,
  channels, busiest month, weekday and hour, first video, top 5 channels, top 5 rewatched. One visible
  line states the rule (YouTube and YouTube Music together, ads left out) and why there are no hours.
- The page text (`apps.ts`) and the guide `why-youtube-watch-counts-differ` stated the old rule
  ("only if" both signs, "ads are not separated out"), so they now state this one. A recap FAQ was
  added. The FAQ claiming the tool reads only JSON was corrected, since it reads HTML too.

Measured:

| check | data | result |
|---|---|---|
| unit tests | `history.test.ts` and `recap.test.ts`, 13 cases | 13/13; whole suite 133/133 |
| revert: ad filter removed | unit | "drops an ad" goes red (1 failed) |
| revert: zone ignored (UTC forced) | unit | "02:30 UTC on 1 January" goes red (1 failed) |
| page vs `jq`, browser in America/Sao_Paulo, `astro dev` | `apps/web/scripts/synthetic-takeout.py`: 6,016 entries, 2022-11 to 2026-11, 176 ads, removed videos, searches, YouTube Music, 1% non-English titles, 16 views in the first hours of 1 January UTC | **5/5 years** match on videos, channels, top 5 channels (names and counts), top 5 rewatched, busiest month, weekday and hour, and first video |
| revert in the browser: ad filter removed | same file | **0/5** years match on videos. Each year is off by exactly its ad count: +6, +50, +42, +41, +37 |
| `astro check`, build, 3 validators | — | 0 errors; 150 pages; 3 × exit 0 |
| layout | 375 px and desktop, light and dark | no horizontal scroll; year buttons and tiles readable in both themes |

Still open:
- **The real export.** The synthetic file is built from what the code expects, so it cannot show that
  Takeout writes "From Google Ads" or English titles for this account. The two extra `jq` lines in
  "Done when" answer exactly that. If the file is not in English and has removed videos, those
  entries lack a link and are dropped: count them with the prefix line and decide.
