---
tags: [fetch, 2026-11-15-organic-traffic]
source: https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/
fetched: 2026-11-15
kind: primary
---

# Cloudflare Pages — Redirecting *.pages.dev to a Custom Domain

> Fetched 2026-11-15 (page "last updated Apr 21, 2026"). Read to see whether `smallwebapps.pages.dev`
> can be sent to the apex the way `www` will be.

## What it says

- Confirm the custom domain is attached to the Pages project, then create a **Bulk Redirect list**
  and a **Bulk Redirect rule** that uses it.
- List entry: source `<project>.pages.dev`, target `https://example.com`, status `301`, with
  "Preserve query string", "Subpath matching", "Preserve path suffix" and "Include subdomains"
  ticked.
- Test by opening `<project>.pages.dev`: "If the URL is now set to your custom domain, then the
  rule has propagated."

## What it does not say

- Nothing about preview deployments. "Include subdomains" would by its name also match
  `<hash>.<project>.pages.dev` and `<branch>.<project>.pages.dev`, which are how PR previews are
  reached. Leaving it unticked is the reading that keeps previews; that has to be checked on a real
  preview URL, not assumed.
- No plan limits, no DNS changes.
