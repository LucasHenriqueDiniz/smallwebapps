---
status: done
kanban:
---

# Slice 1 — `www` answers with a 301 to the apex

## Delivers

Measured 2026-11-15 (`docs/research/2026-11-15-organic-traffic/measurements/hosts-2026-11-15.md`):

| host | today | after |
|---|---|---|
| `www.smallwebapps.com` | no DNS record, `curl` exit 6 | `301` to `https://smallwebapps.com` + same path and query, one hop from `http` and `https` |
| `smallwebapps.pages.dev` | `200`, whole site, canonical → apex | unchanged, or `301` to the apex if PR previews survive it (below) |

Hygiene, done the way tglinks (2026-11-13) and calculebrasil (2026-11-14) did it.

⚠️ **Owner**, Cloudflare dashboard, zone `smallwebapps.com`:
1. **DNS**: `AAAA` record, name `www`, content `100::`, **Proxied**. It has no origin, so without
   step 2 visitors get an error page.
2. **Rules → Redirect Rules**: wildcard, request URL `http*://www.smallwebapps.com/*`, target
   `https://smallwebapps.com/${2}`, status `301`, preserve query string. Cloudflare's own example
   matches only `https://www.*` (`fetches/cloudflare-redirect-www-to-root.md`). With that pattern
   `http://www` takes two hops, which is what tglinks hit before it widened the pattern.

Record both settings in `docs/` next to the deployment notes. Dashboard-only configuration is
invisible to anyone reading the repo.

**`pages.dev`, optional.** Cloudflare documents a Bulk Redirect `smallwebapps.pages.dev` →
`https://smallwebapps.com` (`fetches/cloudflare-pages-redirect-to-custom-domain.md`). Its example
ticks "Include subdomains", which would also catch `<hash>.smallwebapps.pages.dev`, the PR preview
URLs. Do it only without "Include subdomains", and only if a PR preview still answers `200`
afterwards. Otherwise leave it: the canonical already points at the apex, so it is a second copy,
not a competing one.

## Needs

Nothing. No code changes.

## Tests

None in the repo; the check is against production.

## Done when

```bash
curl -s https://smallwebapps.com/sitemap-0.xml | grep -o '<loc>[^<]*</loc>' \
  | sed 's/<[^>]*>//g; s#https://smallwebapps.com##' > /tmp/swa-paths.txt
ok=0; n=0; while read -r p; do n=$((n+1));
  r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://www.smallwebapps.com$p?x=1")
  [ "$r" = "301 https://smallwebapps.com$p?x=1" ] && ok=$((ok+1)) || echo "FAIL $p -> $r"
done < /tmp/swa-paths.txt; echo "www: $ok/$n"
```

**Baseline, run 2026-11-15:** `www: 0/47`, apex `200` on 47/47, `http://www` → `000`.

- **`www: N/N`**, where N is the sitemap count that day (47 today, 20 after slice 4).
- The same loop with `http://www.` prints N/N with a `301` straight to `https://smallwebapps.com…`:
  one hop, not two.
- The loop against the apex, expecting `200`, prints N/N: nothing on the apex moved.
- `pages.dev`, if done: `curl -s -o /dev/null -w '%{http_code}' https://smallwebapps.pages.dev/`
  prints `301`, and the newest PR's preview URL prints `200`.
- Revert check: with the rule disabled for a minute the loop prints `0/N`. Re-enable it.

## If stuck

If Redirect Rules are not offered on the plan, a Bulk Redirect list with one entry
(`www.smallwebapps.com` → `https://smallwebapps.com`, subpath matching, preserve path suffix and
query string) does the same.

## Progress

**2026-11-16 10:42Z: done. `www` answers one `301` to the apex: 20/20 on `https`, 20/20 on `http`.**

What is set in the Cloudflare dashboard, zone `smallwebapps.com`. It is not in the repo, so this is
its record:

| setting | value | set by, when |
|---|---|---|
| DNS | `A` `www` → `192.0.2.1`, **Proxied** (an address with no origin, as on tglinks; the slice asked for `AAAA` `100::`, which does the same) | Claude in Chrome, with the owner's go-ahead, 2026-11-16 ~10:36Z |
| Redirect Rule "www to root (301)" | wildcard `http*://www.*` → `https://${2}`, `301`, preserve query string | filled by another Claude session; the owner clicked Deploy, 2026-11-16, before 10:35Z |

On Deploy the dashboard warned "This rule may not apply to your traffic … confirm that http or a
matching wildcard record is a proxied DNS record". That was expected: `www` had no record yet. The
owner clicked "Ignore and deploy rule anyway", and the record went in a few minutes later.

The loop above, at 10:38Z and again at 10:42Z, against the 20-URL sitemap. `curl --resolve` pins the
Cloudflare edge address `104.21.59.237`, because this Mac's resolver still held the earlier
NXDOMAIN (exit 6):

| check | result |
|---|---|
| `https://www.` + path + `?x=1` → one `301` to the same path and query on the apex | **20/20** |
| `http://www.` + path + `?x=1` → one `301` straight to `https://smallwebapps.com…` | **20/20** |
| apex answers `200` | **20/20** |
| `https://www.smallwebapps.com/` | `301 https://smallwebapps.com/` |
| Googlebot user agent, two query parameters | `301` to the same path with `?a=1&b=2` |
| a merged URL on `www` (`/apps/screenshot-to-text/`) | `301` to the apex path, whose own `301` (slice 4) follows: two hops for an address that never had traffic |

**Revert check**, at 10:41Z with the rule switched off for about two minutes, on 3 paths:
- `https://www` gave `522` after 19 s (no origin);
- `http://www` gave `301` to `https://www…`, from Always Use HTTPS, not to the apex;
- 0/3 on both. Switched back on: 20/20 at 10:42Z.

Resolvers at 10:42Z: 1.1.1.1 and 9.9.9.9 return the Cloudflare addresses. 8.8.8.8 still returned
nothing: it cached the earlier NXDOMAIN, and the zone's negative TTL is 1800 s (SOA minimum).

`pages.dev` (optional): not done. `https://smallwebapps.pages.dev/` still answers `200` and points its
canonical at the apex. That is a second copy, not a competing one.

**Earlier the same night, 03:47Z.** The loop gave 0/20 on both schemes. `www` had no record, and the
zone had 0 Redirect Rules.

The first try that night failed. Claude in Chrome opened "Add record", but clicking into the Name field
let another Chrome extension inject a frame. From then on every click, key and screenshot failed
with "Cannot access a chrome-extension:// URL of different extension", which is what happened on
tglinks on 2026-11-13. The record that went in at 10:36Z was filled with `form_input`, which sets the
fields without clicking into them, and the extension did not interfere.

- [x] Steps 1 and 2 above, in the dashboard.
- [x] The loop: `www` 20/20, the `http://www.` variant 20/20 in one hop, the apex 20/20.
- [x] Revert check: rule off → 0/3; back on → 20/20.
