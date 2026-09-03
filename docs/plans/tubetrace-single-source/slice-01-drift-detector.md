---
status: todo
kanban: 4477d788-4774-446e-a30e-725a642ffa5e
---

# Slice 1 — A command that reports TubeTrace drift

## Delivers

`node scripts/tubetrace-drift.mjs` classifies every file under
`apps/web/src/tools/tubetrace/native/` against its twin in `apps/tubetrace/src/` into three buckets —
identical, differing only by the `@/` import rewrite, and genuinely divergent — and lists the third
bucket by path. Today nothing in the repo can answer "did the copies drift again?" without a human
running `diff -rq` and reading 67 lines of output by eye.

This is the slice that makes the next two arguable. It ships alone and is useful alone.

## Needs

- Nothing new. Node is already required by `scripts/prepare-tubetrace-embed.mjs`, and the script is
  plain `node:fs` like that one.
- 20 minutes reading `scripts/prepare-tubetrace-embed.mjs` for the house style of a script in this
  repo (top-level, no build step, `node:` imports).

## Tests

There is no runner in this repo yet — that is slice 1 of the `pure-logic-tests` plan, and this
slice deliberately does not wait for it. The script is its own check:

- running it on the tree as it stands reports `11 identical, 62 rewrite-only, 5 divergent`
- `--strict` exits 1 while any file is in the divergent bucket, and names each one
- introducing a one-character change into a rewrite-only file (e.g. `components/ui/button.tsx`)
  moves it to the divergent bucket

## Done when

```
node scripts/tubetrace-drift.mjs
```

prints exactly `11 identical, 62 rewrite-only, 5 divergent` and exits 0, and the divergent list names
`components/Dashboard.tsx`, `components/Footer.tsx`, `components/Header.tsx`,
`components/UploadSection.tsx` and `lib/shareCard.ts`.

## If stuck

If the `@/` rewrite turns out not to be a single mechanical substitution across all 62 files, drop
the rewrite-only bucket and ship two buckets (identical / different) plus the raw list. A detector
that reports 67 differences is still strictly more than the repo has now, and the third bucket can
be added once the substitution rule is known.
