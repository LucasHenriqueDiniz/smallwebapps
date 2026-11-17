---
status: done
kanban:
---

# Slice 6 — Re-earn the two guides Google dropped

## Delivers

Two guides answer queries whose first page has no strong page, and Google declined both
(`measurements/url-inspection-2026-11-15.md`, `measurements/serp-us-2026-11-15.md`):

| guide | Google | page one for its query |
|---|---|---|
| `how-to-export-youtube-watch-history` | indexed 2026-10-18, crawled 2026-10-19, **declined**; 16 impressions in 90 days | "export youtube watch history": Reddit, a 2016 Stack Exchange thread, GitHub, two small sites |
| `youtube-watch-history-json-format` | Discovered on 2026-10-18, **unknown** on 2026-11-15 | "watch-history.json": small analyzer sites, GitHub, Reddit. Two competitors run their own format page |

Their text does not duplicate the rest of the cluster: 5-gram Jaccard similarity of at most 0.059.
So the work is to make each page **the most accurate current answer** and prove it, not to reword it:

- **Export how-to**: every step, label and default checked against takeout.google.com on the day,
  with the date on the page. It covers what the result page asks around it: JSON or HTML (link the
  JSON-vs-HTML guide), delivery time, and the "not working" and phone cases that appear as related
  searches. It ends at the next step, opening the file in TubeTrace.
- **`watch-history.json` reference**: every field in the table checked against a real export:
  present, absent on removed videos, absent on ads, with the real key names. A field the export does
  not contain is not documented.

Plus:
- ⚠️ **Owner**: widen `smallwebapps-pedir-indexacao` to guides. Today it asks only for `/apps/`
  pages, and four YouTube guides are out of the index.
- ⚠️ **Owner**: request indexing for both URLs the day they deploy.

## Needs

The owner's real Takeout export (as slice 2). Slice 4 before it, so the reworked guides do not link
cut tools.

## Tests

`pnpm --dir apps/web run build`; `scan-links.mjs` exit 0.

## Done when

- **Export how-to**: the owner follows the deployed page step by step on takeout.google.com, without
  other help, and gets a `watch-history.json`. Pass or fail, with the date. Every UI label quoted on
  the page matches the live screen: N/N labels.
- **Reference**: for each field in the page's table, a `jq` count over the real export of entries
  that carry it (e.g. `jq '[.[] | select(has("subtitles"))] | length'`), written beside the page's
  claim (always / not on removed videos / ads only). N/N fields agree.
- Both URLs answer `200`, are in the sitemap and have no `noindex`. Indexing requested on (date).
- `smallwebapps-pedir-indexacao` covers guides: its next run's log lists at least one `/guides/` URL.

Google's half, read in slice 7: both URLs indexed by day 28.

## If stuck

If Takeout's screens differ by account or region, document the owner's and say which account type it
is. Do not merge variants seen in other people's screenshots.

## Progress

**2026-11-15: the export how-to is rewritten and ships; the field reference waits for the owner's export.**

Read on takeout.google.com in the owner's Chrome, `?hl=en`, before Claude in Chrome disconnected. The
selection was changed on the page and nothing was submitted:

| label quoted on the page | on screen 2026-11-15 |
|---|---|
| "Select data to include" (step 1) | yes |
| "Deselect all" | yes |
| "YouTube and YouTube Music" | yes, with "Watch and search history, videos, comments and other content you've created on YouTube and YouTube Music" |
| counter "1 of 65 selected" after ticking it | yes; the page gives it as an example, since the total varies by account |
| "Multiple formats" | yes |
| "YouTube and YouTube Music options" (dialog) | yes |
| "history", default "HTML", options HTML and JSON | yes, described as "Separate HTML files for your watch and search history" |
| "All YouTube data included" | yes, the button. Its dialog was not read |
| "Next step" | yes |
| "Choose file type, frequency & destination" (step 2) | yes, the heading. The step's own controls were not read: the extension disconnected. The page names no step-2 label in quotes |

**Finding that matters beyond the guide:** Takeout exports YouTube history as **HTML unless you change
it**. The old guide told readers to pick JSON "when Takeout offers a format choice", but the choice is
hidden behind "Multiple formats". The owner's export for slice 2 has to switch it too.

Rewritten:
- Eight steps, down from twenty points. Every label they quote is in the table above. The page dates the check (15 November 2026) and asks
  readers to report a label that changed.
- Sections: JSON or HTML; how long it takes and how long it lasts; when the export does not work (link
  expired, work or school account, Advanced Protection, history turned off, wrong account); on a phone.
  The claims come from Google's own pages, linked under each section and saved in `fetches/`
  (`google-help-download-your-data.md`, `youtube-help-watch-history.md`).
- Removed, because nothing verified them: the 2 GB / 50 GB part sizes, "each part covers a different
  time range", secure deletion, and the other generic advice.

**Production, after #27** (merged `69c617d` at 2026-11-15T23:56Z, live about 400 s later; re-read
2026-11-16T03:50Z with `curl` against `smallwebapps.com`):

| URL | status | `noindex` | in sitemap |
|---|---|---|---|
| `/guides/how-to-export-youtube-watch-history/` | 200 | 0 | yes |
| `/guides/youtube-watch-history-json-format/` | 200 | 0 | yes |

`link-graph.mjs` against production: exit 0. CI on `main` at `69c617d`: success. Indexing is not
requested yet: both URLs are in the queue of `smallwebapps-pedir-indexacao`, behind the recap guide
and the `/apps/` pages, from its 2026-11-16 15:32 UTC run.

**2026-11-17: the owner's export arrived as HTML. The owner ruled that both formats are accepted, and
the slice closes on that export.**

The export is `takeout-20261116T235720Z-1-001.zip`, created 2026-11-16 23:57Z. The history was left in
the default HTML, and the account is set to Portuguese. The owner sent the .zip as Takeout made it,
without switching to JSON, and said on 2026-11-17: *"aceita ambos"*, accept both. So the slice now
asks for a file the analyzer reads, not for a `watch-history.json`. It no longer waits for a second,
JSON export. Counts: `measurements/owner-export-2026-11-16.md`.

How each "Done when" item stands under that ruling:

| item | result |
|---|---|
| export how-to: the owner gets a file the analyzer reads | **pass**, 2026-11-16. The .zip loaded as it came: TubeTrace found the Portuguese-named HTML inside and matched an independent count 2/2 years (slice 2). Whether every step of the page was followed was not recorded |
| quoted UI labels match the live screen | the labels the page quotes are those in the 2026-11-15 table above, read live. The page quotes no step-2 control |
| the reference: each field checked against a real export | **8/8 fields**: `header`, `title`, `titleUrl`, `subtitles`, `time`, `products`, `details`, `activityControls`. The values and counts come from the owner's export, through the HTML that renders each field. The names come from Google's own schema (`fetches/google-data-portability-my-activity-schema.md`) |
| a field the export does not contain is not documented | the page now says outright what that export had no example of: a removed video. The JSON timestamp shape is credited to Google's schema, not to the export |
| both URLs `200`, in the sitemap, no `noindex` | yes, after #31 (below) |
| indexing requested | `smallwebapps-pedir-indexacao`, run of 2026-11-16 15:32Z: its summary reports "Indexação solicitada" for the 6 sitemap URLs out of the index |

What the export changed on the pages:
- **`youtube-watch-history-json-format`**, rewritten. It covers all 8 fields with what each held, and
  cites Google's schema for the names. It corrects 3 claims the export disproved:
  - "subtitles is missing on removed videos": 328 views of live videos had no channel, and no ad had one.
  - "titleUrl carries list=, si=, t=": all 22,422 watch links carried only `v`.
  - "a decade is a few megabytes": the HTML history was 24 MB for 22,812 entries.

  It no longer states the shape of a removed-video entry, since the export had none.
- **`how-to-export-youtube-watch-history`**: switching to JSON is now an optional step. The "JSON or
  HTML" section says the analyzer reads both and cites the real-export check.
- **`youtube-takeout-json-vs-html`**: no longer says "choose JSON" for everyone. It corrects 2 claims
  about our own analyzer:
  - that totals survive an unreadable date (the entry is dropped);
  - that HTML "several times larger" makes a visible wait (the 24 MB HTML in a 41 MB .zip loaded in
    about a second).
- **TubeTrace page** (`apps.ts`): the FAQ, how-to, field list and limits now accept the .zip as it
  comes. The field list gained `details`.

- [x] Export how-to: pass on a file the analyzer reads (owner's ruling, 2026-11-17).
- [x] The field reference, 8/8 fields against the owner's real export and Google's schema.
- [x] `smallwebapps-pedir-indexacao` covers guides (2026-11-15) and requested both on 2026-11-16.
**Production, after #31** (merged `9bdbdd2` at 2026-11-17T12:20:56Z, live about 30 s later; CI on
`main` green):

| URL | status | `noindex` | in sitemap |
|---|---|---|---|
| `/guides/youtube-watch-history-json-format/` | 200 | 0 | yes |
| `/guides/how-to-export-youtube-watch-history/` | 200 | 0 | yes |
| `/guides/youtube-takeout-json-vs-html/` | 200 | 0 | yes |
| `/apps/tubetrace/` | 200 | 0 | yes |

`link-graph.mjs` against production: exit 0. URL Inspection the same day, 12:34Z, before Google had
seen the rewrite: the export how-to is "Crawled - currently not indexed" (last crawl 2026-10-19), and
the field reference is "Discovered - currently not indexed". Google's half is read in slice 7.

- [ ] Not covered: a real JSON file. If one ever turns up, run `scripts/recap-oracle.jq` on it and
      check the JSON timestamp claim.
