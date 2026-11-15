---
status: todo
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
