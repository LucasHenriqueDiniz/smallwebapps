---
status: doing
kanban:
---

# Slice 4 — Narrow the index to the cluster

## Delivers

Option A of the 2026-11-15 decision, chosen by the owner on 2026-11-15. The per-tool evidence is in
`docs/research/2026-11-15-organic-traffic/research.md`, finding 7.

### Option A (chosen): the cluster plus four privacy tools

**Stay indexed (5 tools, 7 guides).** `tubetrace`, `image-to-text`, `pdf-ocr`, `searchable-pdf` and
`exif-viewer`. Guides: `how-to-export-youtube-watch-history`, `youtube-watch-history-json-format`,
`youtube-takeout-json-vs-html`, `why-youtube-watch-counts-differ`, `what-your-youtube-history-reveals`,
`pause-delete-youtube-history` and `privacy-first-file-tools-local-processing`. Slice 3's guide
makes it 8.

**Cut: `noindex, follow`, unlisted, still served (21 tools, 4 guides).**
- YouTube creator: `youtube-tag-extractor`, `youtube-chapter-generator`, `youtube-title-counter`,
  `youtube-description-cleaner`, `youtube-url-parser`.
- PDF: `pdf-compress`, `pdf-merge`, `pdf-split`, `pdf-rotate`, `pdf-to-image`, `pdf-watermark`,
  `pdf-metadata`, `pdf-extract-text`.
- Image: `ai-image-checker`, `image-resize`, `image-crop`, `image-optimize`, `image-flip-rotate`,
  `image-grayscale`, `image-to-pdf`, `image-format-converter`.
- Guides: `csv-cleaning-before-import`, `json-formatting-and-validation`,
  `resize-compress-images-locally`, `browser-based-pdf-tools-safe-and-fast`.

**Merge behind a 301 (3).**

| from | to | what is lost |
|---|---|---|
| `/apps/screenshot-to-text/` | `/apps/image-to-text/` | nothing: `ToolMount.astro` mounts the same `ImageToTextApp`, only `sourceLabel="screenshot"` differs |
| `/apps/image-metadata/` | `/apps/exif-viewer/` | `ImageMetadataApp` is a separate component (dimensions, type, date). Port to `exif-viewer` whatever it shows that `exif-viewer` does not, in this slice, before the 301 |
| `/guides/how-to-analyze-youtube-watch-history/` | `/apps/tubetrace/` | nothing the tool page does not already cover; declined by Google since 2026-09-04 |

Sitemap: 47 → **20** URLs with slice 3 shipped, 19 without.

### Option B (not chosen): keep the 28

Only the three merges, and the two guides whose tools have been `noindex` since 2026-10-18
(`csv-cleaning-before-import`, `json-formatting-and-validation`). Sitemap 47 → 42 (43 with
slice 3).

### Mechanism, either option

- Tools: slugs join `COMMODITY` in `apps/web/src/data/indexing.ts`. `listed.ts` then unlinks them
  everywhere, as it has done since 2026-10-18.
- Guides: `indexable?: false` on `GuideDefinition`. It is read by `guides/[slug].astro` (meta
  robots), the sitemap filter in `astro.config.mjs` (today `isIndexableUrl` only knows `/apps/`),
  the ad gate in `lib/ads.ts`, `/guides/` and `RelatedGuides`, so a guide is listed if and only if
  it is indexable.
- Merges: the source page is no longer built; its `ToolMount` branch and catalog entry go, as with
  the size variants. Two lines each in `apps/web/public/_redirects`, with and without the trailing
  slash.
- ⚠️ **Owner**: `smallwebapps-pedir-indexacao` today asks for `/apps/` pages outside the index. Point
  it at the kept set and the guides only, or it spends the daily quota on pages this slice noindexes.

## Needs

Nothing from other slices.

## Tests

- Unit (vitest), next to `listed.test.ts`: every listed guide is indexable and vice versa. Every
  slug in `_redirects` as a source has no built page. Revert check: list a cut guide by hand, and
  the test goes red.
- `pnpm --dir apps/web run build`, `test`, the three validators.

## Done when

```bash
B=https://smallwebapps.com
curl -s $B/sitemap-0.xml | grep -c '<loc>'                         # 20 (19 before slice 3)
for p in $(cat cut-paths.txt); do                                  # the 25 cut paths
  h=$(curl -s "$B$p"); c=$(curl -s -o /dev/null -w '%{http_code}' "$B$p")
  echo "$c $(printf '%s' "$h" | grep -c 'name="robots" content="noindex') $p"
done | awk '$1==200 && $2==1 {ok++} END {print "noindex: " ok "/" NR}'
for p in /apps/screenshot-to-text /apps/image-metadata /guides/how-to-analyze-youtube-watch-history; do
  for s in "" "/"; do curl -s -o /dev/null -w "%{http_code} %{redirect_url} $p$s\n" "$B$p$s"; done
done                                                               # 6 lines, each 301 to the target with a trailing slash
node apps/web/scripts/scan-links.mjs $B; echo "exit $?"            # 0
```

**Baseline, 2026-11-15:** sitemap 47; cut paths with `noindex` 0/25; merges 0/3: each slashed URL answers `200`, each unslashed one `308` to the slashed URL.

- Sitemap: **20** URLs (19 if slice 3 has not shipped).
- `noindex: 25/25`, all `200`.
- 6/6 lines `301`, each to the merge target, one hop.
- `scan-links` exit 0: no link to an unlisted page, no broken link.
- `image-metadata`'s fields: list them, and show each one on `exif-viewer` for the same test photo
  (N/N).

## If stuck

If Cloudflare Pages serves a stale built page instead of the redirect, check that the page really
left `dist/`. The size-variant slice of `adsense-low-value-review` hit the same ordering.

## Progress

**2026-11-15: built and checked on `dist`. Waiting on merge and the production run of "Done when".**

What changed:
- `indexing.ts`: a `NARROWED` list (the 21 tools of option A) joins `COMMODITY` in `noindexSlugs`.
  `isIndexableUrl` now knows `/guides/<slug>/` too, so the sitemap filter and the ad gate follow guides.
- `guides.ts`: `indexable?: false` on the four cut guides; `isGuideIndexable` and `listedGuides`.
  Related guides, `guidesForTool` and `/guides/` read only listed guides; the curated lists no longer
  name a cut guide. `guides/[slug].astro` serves a cut guide with `noindex`.
- Merges: `screenshot-to-text` and `image-metadata` leave the catalog and `ToolMount`;
  `src/tools/image-metadata/` is deleted; the how-to-analyze guide leaves `guides.ts` and the template.
  Six lines in `_redirects`. `exif-viewer` gains a "File" section with image-metadata's figures, built
  by a pure `file-facts.ts` with the same formulas, shown even when a file has no EXIF.
- Home picks (`home.ts`, category cards), the about page sentence and `llms.txt` name only kept tools.
- The `/apps//` link (slice 5's finding) was the guide template sending a tool-less guide to
  `/apps/${""}/`; a guide with no tool now points at `/apps/`. Fixed here because `scan-links` now
  checks every same-site link.
- `scan-links.mjs`: every same-site link must answer 200, and a linked guide must be indexable. Run
  against production before this change, it printed the `/apps//` link. The "More tools in" rule now
  allows a category with one listed tool (TubeTrace).

Measured on the build (`apps/web/dist`):

| check | result |
|---|---|
| sitemap | **20** URLs: 7 static, 5 tools, 8 guides |
| cut tools served with `noindex` | **21/21** |
| cut guides served with `noindex` | **4/4** |
| merged pages no longer built | 3/3 |
| `scan-links.mjs` on `dist` | exit 0: 0 links to unlisted tools, 0 to unlisted guides or broken pages |
| image-metadata → exif-viewer, same files, same Chrome | 400×300 JPEG with EXIF and 320×180 PNG: all **7** fields image-metadata shows in production (name, size, type, dimensions, aspect ratio, megapixels, last modified) appear identical in exif-viewer's File section, **14/14**. exif-viewer also shows the JPEG's Make, Model and Date Taken, which image-metadata's own scan missed |
| unit tests | 153/153. New: `guides.test.ts` (4), `file-facts.test.ts` (3), `/guides/` redirects |
| revert: one cut guide's flag removed | 2 tests red |
| revert: `guidesForTool` ignores the flag | 1 test red |
| revert: related-guide filters ignore the flag | **stays green**. With today's data no curated list or category ring puts a cut guide next to a listed one, so that filter is defensive and no test can see it |
| `astro check` / validators | 0 errors / 3 × exit 0 |

Redirect targets: the twelve size variants of 2026-10-18 still land on `pdf-compress` and
`image-optimize`, which are now unlisted but live. `redirects.test.ts` now requires a live target for
every rule and an indexable one for the two merges.

Still open:
- [ ] Production: the "Done when" block after the merge.
- [ ] ⚠️ Owner: point `smallwebapps-pedir-indexacao` at the kept set and the guides.
