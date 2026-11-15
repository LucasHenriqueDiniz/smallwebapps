---
status: todo
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
TZ=America/Sao_Paulo jq -r '
  [ .[] | select(.title | startswith("Watched "))
        | select(((.details // []) | map(.name) | index("From Google Ads")) | not)
        | {y: (.time | sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601 | localtime | strftime("%Y")),
           c: (.subtitles[0].name // "Unknown channel")} ]
  | group_by(.y)[]
  | "\(.[0].y) videos=\(length) channels=\([.[].c] | unique | length) top=\([.[].c] | group_by(.) | map({c: .[0], n: length}) | sort_by(-.n, .c) | .[0:5] | map("\(.c):\(.n)") | join(","))"' \
  ~/Downloads/Takeout/YouTube*/history/watch-history.json
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
