---
tags: [fetch, 2026-11-15-organic-traffic]
source: https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/
fetched: 2026-11-15
kind: primary
---

# Cloudflare — Redirect from www to root (Redirect Rules example)

> Fetched 2026-11-15 (page "last updated May 5, 2026"). Read for the rule shape of slice 1.

## What it says

- Forwards HTTPS requests from `www.example.com` to `example.com`, keeping path and query string.
- Wildcard pattern on the request URL `https://www.*`, target `https://${1}`, status **301**,
  "Preserve query string: Enabled".
- Only HTTPS `www.` hosts match; HTTP and non-www requests are left unchanged.

## What it does not say

- No DNS guidance. It does not say that `www` needs a proxied record for the rule to run, nor which
  placeholder to use. The sibling sites used AAAA `100::` proxied (`../measurements/hosts-2026-11-15.md`).
- Because it matches only `https://www.*`, a plain `http://www` request takes two hops (zone HTTPS
  redirect, then this rule). tglinks hit exactly that and widened the pattern to `http*://www.*`.
- No plan limits.
