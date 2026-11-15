---
status: doing
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

Still open:
- [ ] ⚠️ Owner: follow the deployed page on takeout.google.com and get a `watch-history.json`. Pass or
      fail, with the date. Every quoted label must match: N/N. This also covers the step-2 controls.
- [ ] The `watch-history.json` reference, against the owner's real export (blocked on the export).
- [x] `smallwebapps-pedir-indexacao` covers guides (2026-11-15).
