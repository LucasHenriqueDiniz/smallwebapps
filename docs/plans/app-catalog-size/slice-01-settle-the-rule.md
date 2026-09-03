---
status: blocked
kanban: 95e04d1f-1dcb-4265-9ed0-3ad9e3365a17
---

# Slice 1 — Settle which rule cedes, in writing

**Blocked on the owner: `clean-code`'s 1500-line hard limit and this repo's `CLAUDE.md:36` both
apply to `apps.ts` and contradict each other, and only he can say which one gives.** An agent
choosing on its own would be overruling either the house style or the repo's own instruction file,
and would then silently reshape the metadata contract behind 142 tool pages. Unblock by recording
the answer.

## Delivers

`docs/decisions/app-catalog-layout.md` — a decision record that either (a) grants `apps.ts` a named
exception to the size limit and says why, and amends `CLAUDE.md` to state the exception so the next
agent does not re-raise it, or (b) names the target layout, in which case a follow-up plan gets
written and this one closes.

The deliverable is the record either way. No `.ts` file moves in this slice.

## Needs

- The owner's answer. Not a reading task.
- The numbers already in the pitch; no fresh measurement is needed.

## Tests

Prose again, so the check is that it removes the ambiguity rather than restating it. It must say:

- which of the two rules cedes, named by file and line (`clean-code` SKILL.md:60, `CLAUDE.md:36`)
- if the size rule cedes: the exact wording added to `CLAUDE.md`, and whether the exception is
  `apps.ts` alone or any hand-maintained catalog
- if the centralization rule cedes: the target layout, and what the eight current importers of
  `apps/web/src/data/apps.ts` import instead
- what happens to `seoClusterApps`, which is a second array in the same file and may not want the
  same answer as the first

## Done when

```
ls docs/decisions/app-catalog-layout.md && grep -nE "clean-code|CLAUDE\.md:36" docs/decisions/app-catalog-layout.md
```

lists the file and returns at least one line citing each of the two conflicting rules by name, and

```
git grep -n "apps.ts" CLAUDE.md
```

shows `CLAUDE.md` agreeing with whichever answer was recorded — either carrying the new exception,
or no longer pointing at a file that has been split.

## If stuck

If the owner wants the file smaller but will not commit to a layout, take the one move that is
correct under every layout and needs no decision: lift `seoClusterApps` (lines 8335–9087) into its
own module. It is a separate array with a separate purpose, it is ~750 lines, and no candidate
layout in the pitch wants it merged back. That does not bring `apps.ts` under 1500 and must not be
reported as if it did — it removes the one part of the file nobody argues about, and leaves the
argument smaller.
