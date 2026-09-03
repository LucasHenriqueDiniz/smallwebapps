---
status: todo
kanban: 6f320ad9-93df-48ce-85ca-63f7d1c03047
---

# Slice 2 — Decide which TubeTrace copy is the source

**The product call is made.** The owner ruled on 2026-09-03 that `tubetrace.pages.dev` stays a
shipping product and is the original: Small Web Apps carries one tool that *imitates* TubeTrace, so
`apps/tubetrace/src/` is the source and `apps/web/src/tools/tubetrace/native/` is derived output
that stops being maintained by hand. Recorded in the `## Decisions` section of
`docs/architecture/ARCHITECTURE.md`. This slice is no longer blocked.

## Delivers

The decision record, which now exists and already names the source, the generator direction, the
disposition of all five divergent files, and the answer on canonical URLs. **One question in it is
still open**, and closing it is what remains of this slice:

> `pnpm build` runs `sync:tubetrace`, which Vite-builds `apps/tubetrace` and writes
> `apps/web/public/tubetrace-app/`. That output ships unreachable. Does the step get dropped?

That is a build- and deploy-configuration change, so it needs the owner too — but it is a much
smaller question than the one just answered, and slice 3 does not wait on it. The generator rewrites
`native/` either way.

## Needs

- Nothing to start. Slice 1's detector is no longer a prerequisite for *this* slice: the file-by-file
  classification the record needed was measured directly and is written down. The detector is still
  what slice 3 verifies against.
- The owner's answer on the dead `tubetrace-app` build step.

## The decision, in one line

`apps/tubetrace/src/` → `apps/web/src/tools/tubetrace/native/`. One direction, never the reverse: a
fix to shared behaviour lands upstream and reaches the embed by regeneration.

## What was measured, not assumed

Re-run on this branch off `19367d6`:

| claim | result |
|---|---|
| files under `native/` | 78 tracked, 8685 lines |
| classification against `apps/tubetrace/src/` | 11 identical, 62 rewrite-only, 5 divergent |
| divergent files | `components/Dashboard.tsx`, `components/Footer.tsx`, `components/Header.tsx`, `components/UploadSection.tsx`, `lib/shareCard.ts` |
| `tubetrace.pages.dev` in `apps/tubetrace` | **6** tracked files — the pitch says five, which was true when it was written |
| `apps/web/src` references to `tubetrace-app` | none |

`components/UploadSection.tsx` turned out to be a mixed file, not a pure SSR fix: it carries the
rebrand strings *and* the locale-guess move out of the `useState` initializer. `lib/shareCard.ts:108`
is mixed the same way — `localmente` for `no TubeTrace` is intended rebrand, the literal `?` for `ó`
is the hand-copy encoding loss. Both distinctions matter to slice 3's patch set, which is why they
are in the record rather than here.

## Tests

A decision record is prose; its check is that the next slice can be started from it without asking
another question. Slice 3 can: it knows the direction, the substitution, and which of the five files
are patches.

## Done when

```
grep -c "^### " docs/architecture/ARCHITECTURE.md
grep -n "tubetrace.pages.dev" docs/architecture/ARCHITECTURE.md
```

report at least one dated decision entry and at least one line answering the domain question — both
already true — and the record no longer carries a "deliberately still open" paragraph about
`sync:tubetrace`.

## If stuck

If the owner does not want to touch the build step now, close this slice anyway and move the open
question to its own one-slice plan. Leaving a made decision marked unfinished because of a leftover
build script is how the next agent concludes the source question is still open.

**Still standing, independent of all of the above:** the copy that ships today has
`"Meu hist?rico do YouTube analisado localmente"` at
`apps/web/src/tools/tubetrace/native/lib/shareCard.ts:108`, and it renders on a share card users
see. Correcting the `?` to `ó` is a one-line fix, correct under this decision, and it does not wait
for the generator — which may be several slices away. It was the fallback of this slice while it was
blocked and it has not been done.
