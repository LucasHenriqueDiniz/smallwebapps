---
status: todo
kanban: 95e04d1f-1dcb-4265-9ed0-3ad9e3365a17
---

# Slice 1 — Settle which rule cedes, in writing

**Settled on 2026-09-03: the plugin wins.** The owner ruled that everything follows the `hexagram`
skills, so `clean-code`'s 1500-line hard limit (`SKILL.md:60`) binds `apps/web/src/data/apps.ts` with
no exception, and this repo's centralization rule at `CLAUDE.md:36` cedes. `CLAUDE.md` has been
reworded to defer — it now asks for one *import surface* for app metadata and leaves file size to the
skill — and the precedence itself is written into the "Where the house rules come from" section so
the next collision resolves without asking. Recorded in the `## Decisions` section of
`docs/architecture/ARCHITECTURE.md`. This slice is no longer blocked on the owner.

## Delivers

What is left is the half the ruling did not answer: **the target layout**, and what the eight current
importers of `apps/web/src/data/apps.ts` import instead. Under branch (b) of the original slice that
also means a follow-up plan for the move itself, and this one closes.

No `.ts` file moves in this slice either. The deliverable is still a written layout.

## Needs

- The candidate layouts already listed in the pitch: one module per tool behind a barrel, a split by
  category, `seoClusterApps` lifted out on its own, or Astro content collections — which the repo
  already has available and does not use for this data.
- The eight importers, measured on this branch with
  `git grep -ln "data/apps" -- 'apps/web/src'`:
  `components/site/Footer.astro`, `components/site/Header.astro`,
  `pages/.well-known/agent-index.json.ts`, `pages/about.astro`, `pages/apps/[slug].astro`,
  `pages/apps/index.astro`, `pages/index.astro`, `pages/og/[slug].svg.ts`.
- No fresh measurement of the file: 9088 lines, 142 entries in `apps` (line 3 to ~8334),
  `seoClusterApps` at 8335, `appMap` at 9088.

## Tests

Prose, so the check is that it removes the ambiguity rather than restating it. It must say:

- the target layout, concretely enough to move files against
- what each of the eight importers imports instead, and whether the import specifier changes at all
- what happens to `seoClusterApps` — a second array with a separate purpose in the same file, which
  may not want the same answer as the first
- whether the layout keeps every entry reviewable in a diff, which is the reason the size limit
  exists

What it no longer needs to say is which of the two rules cedes. That is decided and cited.

## Done when

The layout is written down and a follow-up plan exists to execute it:

```
grep -nE "clean-code|CLAUDE\.md:36" docs/architecture/ARCHITECTURE.md
ls docs/plans/app-catalog-*/
```

the first citing both conflicting rules by name — already true — and the second listing the plan that
performs the split.

⚠️ **Do not close this slice by reporting the ruling.** The ruling is already in the tree; closing on
it would leave a 9088-line file under a binding limit and no plan to bring it down.

## If stuck

If the layout will not settle, take the one move that is correct under every candidate and needs no
decision: lift `seoClusterApps` (lines 8335–9087) into its own module. It is a separate array with a
separate purpose, ~750 lines, and no candidate layout wants it merged back. That does **not** bring
`apps.ts` under 1500 and must not be reported as if it did — it removes the one part of the file
nobody argues about, and leaves the argument smaller.

⚠️ **The centralization rule is restated in five other places** — `.claude/AGENT_REFERENCE.md:76`,
`.claude/INSTRUCTIONS.md:46`, `.claude/README.md:103`, plus `README.md:114` and
`.claude/templates/PULL_REQUEST.md:29` which point agents and reviewers at the file path. All of them
are still accurate today, because nothing has moved yet. Whichever plan performs the split has to
update them in the same change, by hand and one at a time: `README.md` is the public repo's
"how to add a tool" section and reads as documentation for humans, not a rule to sed.
