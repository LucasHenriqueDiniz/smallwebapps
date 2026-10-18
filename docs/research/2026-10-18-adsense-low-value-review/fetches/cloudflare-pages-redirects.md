---
tags: [fetch, 2026-10-18-adsense-low-value-review]
source: https://developers.cloudflare.com/pages/configuration/redirects/
fetched: 2026-10-18
kind: vendor
---

# Cloudflare Pages — Redirects

> Fetched 2026-10-18 · the `_redirects` file the site already uses, read before adding 301s for the
> retired variant pages.

## What it says

- Format: "[source] [destination] [code?]", and the code defaults to 302: "(default: 302)".
- Limits: "2,000 static redirects and 100 dynamic redirects", 1,000 characters per declaration.
- "Redirects are always followed, regardless of whether or not an asset matches the incoming request."
- "You may only include a single splat in the URL." and "Every named placeholder can only be referenced once."

## What it does not say

- Whether a source with a trailing slash also matches the same path without one. It only shows
  examples. The measurement in `research.md` answers it: it does not.
