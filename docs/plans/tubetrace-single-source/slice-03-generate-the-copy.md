---
status: cancelled
kanban: 872312c8-f4b1-497a-a384-fccbef41e581
---

# Slice 3 — Generate the second copy instead of maintaining it

> **Cancelled 2026-09-05.** There is no second copy to generate. The owner ruled that TubeTrace is a
> tool of this site rather than a separate product, so `apps/tubetrace` — the input this generator
> was to read — was deleted at `516d019`, and `apps/web/src/tools/tubetrace/` is the only copy and
> stays hand-written. This slice said the alternative "is ruled out. This slice stands"; the
> alternative is what happened. The record is *TubeTrace is a tool of this site, and `apps/tubetrace`
> is deleted* in `docs/architecture/ARCHITECTURE.md`. Its one item that did survive — the `?` for
> `ó` in `lib/shareCard.ts:108` — is fixed at `d6ee4bb`, as a plain bug in the tool's own code.

**Unblocked on 2026-09-03: the direction is decided.** The owner ruled that
`tubetrace.pages.dev` stays a shipping product and is the original — Small Web Apps carries one tool
that *imitates* TubeTrace. So the generator runs
**`apps/tubetrace/src/` → `apps/web/src/tools/tubetrace/native/`**, one direction, never the reverse:
a fix to shared behaviour lands upstream in `apps/tubetrace/src/` and reaches the embed by
regeneration. The record is the `## Decisions` section of `docs/architecture/ARCHITECTURE.md`.

The alternative — deleting `apps/tubetrace` and making `native/` the only copy, in which case this
slice was to be deleted rather than written — is ruled out. This slice stands.

⚠️ **Not started here.** The decision was registered, not implemented. Nothing under `scripts/` or
`native/` has been written yet.

## Delivers

`scripts/generate-tubetrace-native.mjs`, which rewrites `apps/web/src/tools/tubetrace/native/` from
`apps/tubetrace/src/` by applying the `@/` → `@/tools/tubetrace/native/` substitution and then the
recorded rebrand patch for the five files the decision record marks as intended. After it,
`native/` is generated output and stops being reviewed as hand-written code. **No file-size
exception is claimed, because the plugin has none:** `clean-code`'s only `Exceptions:` list is
`SKILL.md:53-55`, under `## Function size`; `## File size` (`SKILL.md:57-66`) carries no exception.
Nor is one needed — of the 78 files the largest is 728 lines
(`components/ui/sidebar.tsx`) against a 1500-line hard limit, and only 2 pass the 500-line soft
limit.

## Needs

- Slice 1's detector, which becomes the generator's verification step. This is the only hard
  prerequisite left.
- The decision record's patch table, already written. Two of the five files are mixed and the
  generator must not flatten them:
  - `components/UploadSection.tsx` — rebrand strings **and** the locale guess moved out of the
    `useState` initializer into an effect. Both stay.
  - `lib/shareCard.ts:108` — `localmente` for `no TubeTrace` is intended rebrand and stays; the
    literal `?` where the source has `ó` is an encoding loss from the hand copy, and the generated
    file must not reproduce it.
  - `components/Dashboard.tsx`, `components/Footer.tsx`, `components/Header.tsx` — pure rebrand.
- Nothing further from slice 2. Its one remaining open item is the dead `tubetrace-app` build step,
  which the generator does not touch.

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
