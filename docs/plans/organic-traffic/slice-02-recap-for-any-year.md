---
status: done
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

**2026-11-17: checked against the owner's real export. 2/2 years match; one rule fixed.**

The export (`takeout-20261116T235720Z-1-001.zip`, 41 MB) holds the history as **HTML, not JSON**, and
the account is set to Portuguese. That changed the check in two ways:
- The `jq` oracle reads JSON only. A second oracle reads the HTML:
  `apps/web/scripts/recap-oracle-html.py`. It is plain Python with regular expressions and shares no
  code with the page. Run it with `python3 -I`.
- The paths are translated: `Takeout/YouTube e YouTube Music/histórico/histórico-de-visualização.html`,
  not `…/history/watch-history.json`. The `jq` commands above assume the English names.

What the file holds, counted by the oracle (no titles or channel names are recorded here):

| entries | 22,812 |
|---|---|
| "Watched" + a link to a video (YouTube 19,689, YouTube Music 2,733) | 22,422 |
| of those, ads ("From Google Ads", in English even on this account) | 101 |
| "Viewed" + a link to a community **post**, or a post no longer available | 389 |
| "Used Shorts creation tools" | 1 |
| watched without a link (removed videos) | 0 |
| dates | all "16 de nov. de 2026, 20:55:06 BRT" (Portuguese months, `BRT`) |
| what "Por que isso está aqui?" lists for **every** entry, posts included | "YouTube watch history" |

**The rule had a hole.** The page said an entry counts when *any* of three signs holds, one being
activityControls "YouTube watch history". On this export that sign is on all 22,812 entries. So a JSON
export of the same account would have counted the 389 posts and the Shorts tool as videos. The HTML
reader, which tested only the "Watched" prefix, would not. The rule now has two signs, a title
starting "Watched" or a link to a video, and both readers use it (`countsAsView` in `history.ts`):
- the prefix test is `^Watched\s`, because the HTML export puts a no-break space after the word;
- the tool page, the guide `why-youtube-watch-counts-differ` and `recap-oracle.jq` state the new rule;
- the tool page and the export guide say the folder and file names follow the account's language.

Measured in Chrome (the app's browser pane, zone `America/Sao_Paulo`, same as the export's `BRT`).
The page is the production build, served by `astro preview`. The real 41 MB zip is fed to the page's
file input, the same path as choosing it by hand:

| check | result |
|---|---|
| file found inside the zip under its Portuguese name | yes, in 1.1 s |
| years offered | 2026, 2025: the oracle's 2 years |
| per year: videos, channels, top 5 channels (names and counts, ties by name) | **2/2 years match**, on `main` and again on this branch |
| total | 22,321 on the page = 22,321 in the oracle |
| revert in the browser: HTML ad filter removed | **0/2** years match. 2026 is +57 and 2025 +44, exactly each year's ads (101 in all) |
| unit: post and Shorts-tool entries dropped | red with the old "YouTube watch history" sign back in; green with the fix |
| unit: "Watched" + no-break space read | red with a plain-space prefix; green with `\s` |
| suite, `astro check`, build, 3 validators, `scan-links`, `link-graph` | 159/159; 0 errors; exit 0 on all |
| page text with JavaScript off | states the rule, that ads are left out and why there are no hours |

Not covered: the JSON reader against a real file. That needs a JSON export of this account, which
slice 6 needs anyway. Run `recap-oracle.jq` then.
