---
status: done
epic: tubetrace
---

# TubeTrace has two live copies and no generator

> **The title is false, and that is the point.** Neither copy was live. See
> `docs/postmortem/tubetrace-single-source.md`.

> **Resolved 2026-09-05, and not the way this pitch or its plan expected.** The problem it describes
> was real and the measurements below are correct; the fix was not a generator. The owner ruled that
> TubeTrace is a tool of this site and never was a separate product, so `apps/tubetrace` was deleted
> and `apps/web/src/tools/tubetrace/` is the only copy. Two copies, so no second copy to generate.
> The record is *TubeTrace is a tool of this site, and `apps/tubetrace` is deleted* in the
> `## Decisions` section of `docs/architecture/ARCHITECTURE.md`.
>
> An earlier note here said the question was decided on 2026-09-03 in favour of keeping
> `tubetrace.pages.dev` as the source. That record is superseded; this pitch is kept as the
> historical statement of the problem, not as a live proposal.

`apps/tubetrace/src/` and `apps/web/src/tools/tubetrace/native/` are the same application twice.
Nothing produces one from the other, and both ship.

## What is actually true

Measured on `origin/main` at `fdfed01`:

| claim | command | result |
|---|---|---|
| size of the second copy | `git ls-files apps/web/src/tools/tubetrace/native \| wc -l` | 78 files |
| | `git ls-files apps/web/src/tools/tubetrace/native \| xargs wc -l` | 8685 lines |
| files that differ at all | `diff -rq apps/web/src/tools/tubetrace/native apps/tubetrace/src` | 67 of 78 differ, 11 identical |

The earlier audit said every file differed. It does not: **11 are byte-identical**, and of the 67
that differ, **62 differ only by one mechanical import rewrite** — `@/lib/utils` on one side against
`@/tools/tubetrace/native/lib/utils` on the other. Exactly **5 files carry real divergence**:

- `components/Dashboard.tsx`, `components/Footer.tsx`, `components/Header.tsx` — the TubeTrace
  wordmark, favicon and footer links replaced with Small Web Apps ones
- `components/UploadSection.tsx` — the locale guess moved out of the `useState` initializer and into
  an effect, which is an SSR fix the standalone app never needed
- `lib/shareCard.ts` — the share-card title, filename and footer domain rebranded

So the fork is not accidental drift. It is a rebrand plus one hydration fix, applied by hand and
recorded nowhere.

## Why it still costs

**The file the "someone will fix the parser twice" argument rests on is identical.**
`lib/parser.ts` — 521 lines on each side — is byte-for-byte the same. That is the strongest form of
the problem, not the weakest: 62 files sit one `sed` away from each other, so there is a generator
shaped exactly like this codebase and nobody wrote it. `scripts/prepare-tubetrace-embed.mjs` runs a
Vite build and copies a bundle; it does not produce `native/`.

**One of the two builds ships nothing anyone can reach.** `pnpm build` runs `sync:tubetrace` first,
which builds `apps/tubetrace` and writes `apps/web/public/tubetrace-app/`. No `.astro`, `.tsx` or
`.ts` file under `apps/web/src` references `tubetrace-app`. The tool users reach at
`/apps/tubetrace` is the `native/` copy, mounted in `ToolMount.astro:175`.

> **Correction, 2026-09-03.** This paragraph said `_redirects` "301s every path under it away".
> It does not: `apps/web/public/_redirects:6-12` is seven exact paths with no wildcard, and they
> match the shell files `scripts/prepare-tubetrace-embed.mjs:51-70` already deletes. What the script
> keeps on purpose — `embed.js`, `embed.css`, `assets/*` — is redirected by nothing and ships
> publicly fetchable behind `X-Robots-Tag: noindex` (`_headers:16`). The heading still holds by the
> other half of the evidence: nothing references the output, so nobody reaches it. It is
> unreferenced, not unreachable.

**Drift has already produced a defect.** `apps/web/src/tools/tubetrace/native/lib/shareCard.ts:108`
reads `"Meu hist?rico do YouTube analisado localmente"` where the source file has
`"Meu histórico…"` — an encoding loss that only happened because the copy was made by hand.

## What this pitch does not decide

`apps/tubetrace` is its own product: it has `wrangler.toml`, a `deploy` script targeting the
Cloudflare project `tubetrace`, and canonical URLs on `tubetrace.pages.dev` in five tracked files.
`.github/workflows/ci.yml` says Cloudflare Pages builds both apps on every push.

Whether that second product stays alive is a product call, not a refactor. The plan therefore
measures first, asks second, and only then generates.
