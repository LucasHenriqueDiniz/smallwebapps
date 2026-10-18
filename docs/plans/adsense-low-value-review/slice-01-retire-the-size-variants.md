---
status: done
kanban:
---

# Slice 1 — Retire the 12 size and format variants behind 301s

## Delivers

The 12 slugs in `SIZE_VARIANTS` stop being pages. Each answers a single 301 to the tool it wraps:

| retired | redirect to |
|---|---|
| `compress-pdf-to-100kb`, `-200kb`, `-500kb`, `-1mb` | `/apps/pdf-compress/` |
| `compress-image-to-50kb`, `-100kb`, `-200kb`, `compress-jpg-to-100kb`, `compress-png-to-100kb`, `compress-webp-to-100kb` | `/apps/image-optimize/` |
| `jpg-to-text`, `png-to-text` | `/apps/image-to-text/` |

The research found that none of them loses a feature. `PdfCompressApp` uses `targetKB` only in two
strings, `ImageCompressVariantApp` only presets the max-size slider the base tool already has, and
the `*-to-text` pair only narrows the file picker
([[2026-10-18-adsense-low-value-review/research|research]], finding 2).

Removed together:

- the 12 entries in `seoClusterApps` (`apps/web/src/data/apps.ts`);
- their `ToolMount.astro` branches, plus `PdfCompressVariantApp.tsx` and
  `ImageCompressVariantApp.tsx` once nothing imports them. `PdfCompressApp`'s `targetKB` prop goes
  too, since nothing sets it any more;
- `SIZE_VARIANTS` in `indexing.ts`;
- the curated related-tool pairs in `pages/apps/[slug].astro` that point at them, which today put 4
  to 6 variant links on `pdf-compress`, `image-optimize`, `image-to-text` and `screenshot-to-text`.

Added: 24 lines in `apps/web/public/_redirects`, one with and one without the trailing slash for
each slug, and `301` written out because the default is 302. The source must match exactly:
`/tubetrace-app` without the slash answers 404 in production today.

## Needs

Nothing. This is the first slice.

## Tests

- `indexing.ts` has no `SIZE_VARIANTS`, and its existing tests still pass.
- No retired slug appears in `apps` (vitest, against the `apps` import).

## Done when

```bash
pnpm --dir apps/web run build
pnpm --dir apps/web test --run
```

both exit 0, and on the build output:

```bash
ls apps/web/dist/apps | grep -cE '^(compress-(pdf|image|jpg|png|webp)-to-|jpg-to-text$|png-to-text$)'
grep -rhoE 'href="/apps/(compress-[a-z]+-to-[0-9a-z]+|jpg-to-text|png-to-text)/?"' apps/web/dist | wc -l
grep -cE '^/apps/(compress-|jpg-to-text|png-to-text)' apps/web/public/_redirects
```

print `0`, `0` and `24`.

After deploy, all 24 sources answer `301` with a `location` ending in a trailing slash, and the
target answers `200` with no further redirect: 24 of 24.

## If stuck

If deleting the variant components breaks a type elsewhere, leave the files and delete only their
`ToolMount` branches. Dead components are a follow-up. A live doorway page is the thing this slice
removes.

## Closed 2026-10-18

Committed in `b3b608c`. Build-side checks: `0` variant directories in `dist/apps`, `0` hrefs to them,
`24` rules in `_redirects`, 130 tool pages built, and a sitemap identical to production at 47 URLs.
`redirects.test.ts` adds 50 tests. Each of the four ways of breaking the file was tried and turned
it red: a missing slash form, a target that is not indexable, a rule that shadows a live page, and
a rule left at the default 302.

The 24-of-24 production check runs in slice 5, after deploy.
