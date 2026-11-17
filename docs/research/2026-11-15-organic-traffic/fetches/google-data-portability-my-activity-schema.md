---
tags: [fetch, 2026-11-15-organic-traffic]
source: https://developers.google.com/data-portability/schema-reference/my_activity?hl=en
fetched: 2026-11-17
kind: primary
---

# Google for Developers — Data Portability API, My Activity schema reference

> Fetched 2026-11-17; the page says "Last updated 2025-02-13 UTC". Read for slice 6: the field
> names of a YouTube history entry, from Google rather than from other people's parsers.

## What it says

- "Object is exported in these formats: HTML JSON."
- "Data fields produced in an export vary by service and user action and some services or actions
  don't produce each data field described."
- The fields, with the YouTube examples where the page gives one:

| field | Google's definition (short) | YouTube example on the page |
|---|---|---|
| `header` | the card title: app, domain or product name | "YouTube" |
| `title` | high-level summary of the activity | "Watched...", "Subscribed to...", "Visited ..." |
| `titleUrl` | URL used in the title | "youtube url" |
| `subtitles` | detail shown under the title | "Channel information name and url" |
| `description` | extra information | — |
| `time` | time and date of the activity | none for YouTube; the Maps example is `2023-08-23T03:49:28.734Z` |
| `products` | the products the data belongs to | "Youtube" |
| `details` | where the activity comes from, e.g. an ad | "From Google Ads" |
| `activityControls` | the data-collection setting that saved it | "YouTube watch history, YouTube search history" |
| `locationInfos`, `imageFile`, `audioFiles`, `attachedFiles` | location and attachments | — |

## What it does not say

- What a YouTube watch entry looks like as a whole, or which fields one always has.
- The shape of `subtitles` in JSON beyond "name and url".
- Anything about removed videos, or about the HTML layout.
- The YouTube schema page (`/schema-reference/youtube`, updated 2026-09-28) does not cover watch
  history; it lives under My Activity.
