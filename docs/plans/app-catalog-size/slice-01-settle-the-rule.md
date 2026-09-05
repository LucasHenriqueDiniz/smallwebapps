---
status: done
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

## The layout

**One module per tool behind a barrel, with `seoClusterApps` lifted into its own directory as part of
the same move.** Decided 2026-09-05. The argument, the four candidates costed against the real
importers, and the new `CLAUDE.md` wording are in `docs/decisions/app-catalog-layout.md`; the record
is the dated entry at the top of the `## Decisions` section of `docs/architecture/ARCHITECTURE.md`.

```
apps/web/src/data/apps.ts                    ~20 lines   the import surface: exports apps, appMap
apps/web/src/data/catalog/index.ts          ~135 lines   129 imports + `export const coreApps`
apps/web/src/data/catalog/<slug>.ts          129 files   57-136 lines each, one AppDefinition
apps/web/src/data/seo-clusters/index.ts      ~19 lines   13 imports + `export const seoClusterApps`
apps/web/src/data/seo-clusters/<slug>.ts      13 files
```

`apps.ts` composes `[...coreApps, ...seoClusterApps]` and derives `appMap`. Every resulting file is
under the 500-line **soft** limit, not merely under the 1500-line hard one.

**What the eight importers import instead: nothing different.** The surface stays at
`apps/web/src/data/apps.ts`, so `import { apps } from "@/data/apps"` (and
`import { apps, appMap } from "@/data/apps"` in `pages/apps/[slug].astro`) is byte-identical before
and after in all eight files. That is why the entries land in `data/catalog/` rather than in a
`data/apps/` directory with an `index.ts` — a directory barrel keeps the specifier too, but only by
relying on directory-index resolution under `"moduleResolution": "Bundler"` and on Vite resolving it
the same way inside `.astro` frontmatter. The before/after table, file by file, is in the decision
document; the check for the move slice is that `git diff` over those eight files is empty.

**What happens to `seoClusterApps`:** it becomes `data/seo-clusters/`, 13 modules and a 19-line
index, and it stops being a private `const` that mutates a public export — line 9086's
`apps.push(...seoClusterApps)` is replaced by the spread, in the same order, so shipped output does
not change. It does **not** merge into `coreApps`: all 13 slugs are noindexed (checked against
`apps/web/src/data/indexing.ts` — ten in `SIZE_VARIANTS`, three in `COMMODITY`), and the split is the
only marker in the data that says these entries are a different kind of thing.

**Reviewability, which is the reason the limit exists:** after the move a one-tool change is a diff
of one ~60-line module instead of sixty lines somewhere inside nine thousand, and the ~135-line
`catalog/index.ts` changes only when a tool is added or removed. The barrel is a single *import
surface*, which `CLAUDE.md:42` asks for; it is not a single *edit surface*, which `clean-code`
forbids. Today's `apps.ts` is both.

**Cost, stated rather than buried:** adding a tool goes from one file to two, so step 1 of
`CLAUDE.md`'s five-step procedure has to be rewritten. The replacement wording for `CLAUDE.md:42-46`
and `CLAUDE.md:68` is written out verbatim in the decision document, and applies **after** the move,
not now — the bullet is still accurate on this branch.

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

**Not by the block this slice used to carry.** It was
`grep -nE "clean-code|CLAUDE\.md:36" docs/architecture/ARCHITECTURE.md` and
`ls docs/plans/app-catalog-*/`, and both pass on this branch right now with none of the remaining
work done: the grep returns four lines and exit 0 because the ruling is already recorded, and the
`ls` returns exit 0 because the glob matches this slice's own directory,
`docs/plans/app-catalog-size/`, which existed before the ruling. It read as "a follow-up plan
exists" and measured "this plan exists".

The layout is written down and a follow-up plan exists to execute it:

```
grep -n "^## The layout" docs/plans/app-catalog-size/slice-01-settle-the-rule.md
ls docs/plans/app-catalog-layout/
```

Both exit 1 today. The first passes once this file gains a `## The layout` section that names the
target layout concretely enough to move files against, what each of the eight importers imports
instead, and what happens to `seoClusterApps`. The second passes once a separate plan directory
exists — `docs/plans/app-catalog-layout/`, a path nothing in the tree uses — holding the slices that
perform the move.

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

## Closed 2026-09-05

What closed it: the layout above, argued in full in `docs/decisions/app-catalog-layout.md`, recorded
as a dated entry at the top of `## Decisions` in `docs/architecture/ARCHITECTURE.md`, and handed to
`docs/plans/app-catalog-size/slice-02-move-the-catalog.md` to execute. No `.ts`, `.tsx` or `.astro`
file changed, and `CLAUDE.md` was left alone on purpose — its bullet still describes this branch
correctly, and the replacement wording is written down waiting for the move.

Every number in the layout was re-measured on `d8508be` rather than carried over from the pitch. Two
of them differ from what this file assumed: `apps` holds **129** entries, not 142 — the 142 is the
composed total, 129 plus the 13 in `seoClusterApps` — and `seoClusterApps` is not merely a second
array, it is a private `const` merged into the exported one by `apps.push(...)` on line 9086. The
category split died on arithmetic that had never been done: three of its five files would still
breach the hard limit (Developer Tools 3268 lines, Data Tools 2507, Image / Inspection 1722).

**One half of the "Done when" above was not met literally, and this is deliberate.**
`ls docs/plans/app-catalog-layout/` still exits 1. The follow-up plan is slice 2 of *this* plan
directory instead, because `workflow` gives one plan directory per pitch and this is still
`docs/pitches/app-catalog-size.md` — a second directory for the same pitch would split the board and
leave two half-plans. The requirement the check was standing in for, "a follow-up plan exists to
execute it", is met by `docs/plans/app-catalog-size/slice-02-move-the-catalog.md`. The card's own
criterion — `ls docs/decisions/app-catalog-layout.md` plus a `grep` for both rules by name — passes.
