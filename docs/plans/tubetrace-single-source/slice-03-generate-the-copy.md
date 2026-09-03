---
status: blocked
kanban: 872312c8-f4b1-497a-a384-fccbef41e581
---

# Slice 3 — Generate the second copy instead of maintaining it

**Blocked on slice 2: the generator runs in whichever direction that decision picks, and it has not
been made.** This slice is written now so the work is scoped, not so it can start.

The body below assumes the answer is "`tubetrace.pages.dev` stays, `apps/tubetrace/src` is the
source". If the answer is the other one, this slice is deleted rather than rewritten — deleting a
directory does not need a generator.

## Delivers

`scripts/generate-tubetrace-native.mjs`, which rewrites `apps/web/src/tools/tubetrace/native/` from
`apps/tubetrace/src/` by applying the `@/` → `@/tools/tubetrace/native/` substitution and then the
recorded rebrand patch for the files slice 2 marked as intended. After it, `native/` is generated
output and the `clean-code` exception for generated code applies to all 8685 lines of it.

## Needs

- Slice 2's decision record, naming the source direction and classifying the five divergent files.
- Slice 1's detector, which becomes the generator's verification step.

## Tests

- running the generator on a clean tree leaves `git status --porcelain apps/web/src/tools/tubetrace/native` empty
- deleting one generated file and rerunning restores it byte-identically
- `pnpm run check` still passes afterwards, i.e. the rewritten import paths resolve
- the drift detector from slice 1 reports 0 unexplained divergences

## Done when

```
node scripts/generate-tubetrace-native.mjs && git status --porcelain apps/web/src/tools/tubetrace/native
```

prints nothing after the generator runs, and

```
node scripts/tubetrace-drift.mjs --strict
```

exits 0.

## If stuck

If the rebrand patch cannot be expressed mechanically — because the five divergent files have
diverged structurally rather than in strings by the time this starts — narrow the generator to the
62 rewrite-only files, leave the 5 hand-maintained, and make `--strict` allowlist exactly those
five by path. 62 of 67 generated is most of the benefit, and the allowlist turns the remainder from
invisible drift into a list somebody has to justify.
