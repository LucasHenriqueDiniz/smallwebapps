---
status: todo
kanban: 5e3243d9-2147-4fa3-aa98-3f463284311e
---

# Slice 2 — Move the catalog into per-tool modules

Execute the layout decided in `docs/decisions/app-catalog-layout.md` and recorded in the
`## Decisions` section of `docs/architecture/ARCHITECTURE.md`. Nothing here is a fresh choice: the
target layout, the disposition of `seoClusterApps`, and the wording the docs get are all written
down. This slice moves files and updates the six prose files that name the old shape.

## Delivers

`apps/web/src/data/apps.ts` under the `clean-code` hard limit (`SKILL.md:60`), with every file it
composes under the 500-line **soft** limit:

```
apps/web/src/data/apps.ts                    ~20 lines   the import surface: exports apps, appMap
apps/web/src/data/catalog/index.ts          ~135 lines   129 imports + `export const coreApps`
apps/web/src/data/catalog/<slug>.ts          129 files   57-136 lines each, one AppDefinition
apps/web/src/data/seo-clusters/index.ts      ~19 lines   13 imports + `export const seoClusterApps`
apps/web/src/data/seo-clusters/<slug>.ts      13 files
```

`apps.ts` becomes:

```ts
import type { AppDefinition } from "@smallwebapps/data";
import { coreApps } from "@/data/catalog";
import { seoClusterApps } from "@/data/seo-clusters";

export const apps: AppDefinition[] = [...coreApps, ...seoClusterApps];
export const appMap = Object.fromEntries(apps.map((app) => [app.slug, app]));
```

The spread reproduces what `apps.push(...seoClusterApps)` does on line 9086 today — the 129 first,
the 13 appended — so shipped output is byte-identical. The post-export mutation goes away with it.

**The eight importers are not touched.** The specifier `@/data/apps` and both named exports survive,
which is the whole reason the entries land in `data/catalog/` instead of a `data/apps/` directory
with an `index.ts`; see the decision document for why directory-index resolution was not worth
testing.

Also in this slice, because they go stale the moment the files move:

| file | what it says today | after |
|---|---|---|
| `CLAUDE.md:42-46` | architecture bullet naming `apps.ts` as "today's" surface | new wording, verbatim in the decision document |
| `CLAUDE.md:68` | step 1 of "Adding or changing tools" | new wording, verbatim in the decision document |
| `README.md:103,114` | repo tree comment and the public "how to add a tool" section, with a link to the file | rewritten by hand — this is documentation for humans, not a rule to `sed` |
| `.claude/INSTRUCTIONS.md:21,46,53,72,88` | five separate restatements | rewritten one at a time |
| `.claude/AGENT_REFERENCE.md:10,26,46,69,76,86,152-153` | seven, one of which is a `grep` command an agent is told to run | rewritten one at a time; the `grep` gets a new path |
| `.claude/README.md:98,110` | two | rewritten |
| `.claude/templates/PULL_REQUEST.md:29` | reviewer checklist item | rewritten |

No script or CI job references the path: `grep -rn "data/apps" .claude scripts .github package.json`
returns only those prose files, so nothing executable breaks.

## Needs

- Nothing outstanding. The rule conflict was settled 2026-09-03 and the layout on 2026-09-05.
- A mechanical split is fine and probably wise — 142 entries at 57-136 lines each is not hand work —
  but the script is a one-off, not a build step. Do not leave a generator behind: these modules are
  hand-maintained source from the moment they exist, and `clean-code`'s generated-code exception does
  not reach file size anyway.
- Slug-to-filename mapping is the identity: `slug: "compress-pdf-to-100kb"` →
  `catalog/compress-pdf-to-100kb.ts`. Slugs are already kebab-case and unique — `appMap` on line 9088
  would silently collapse duplicates today, so uniqueness is worth asserting during the split rather
  than assumed.

## Tests

- `pnpm --dir apps/web run build` succeeds.
- `pnpm --dir apps/web run check` passes — `verbatimModuleSyntax` is on
  (`packages/config/tsconfig.astro.json`), so 142 new modules importing a type must use
  `import type`.
- `./.claude/skills/build-validator.sh` and `./.claude/skills/seo-adsense-validator.sh`.
- The move is a refactor, so the real test is that the built output does not change. Build on
  `d8508be` and on the branch and diff `apps/web/dist` — it must be empty. Order is preserved by
  construction, and the two places where source order is visible (the `searchApps` array serialized
  into `Header.astro`, and `/.well-known/agent-index.json`) are exactly what a `dist` diff catches.

## Done when

```
wc -l apps/web/src/data/apps.ts
git ls-files apps/web/src/data/catalog apps/web/src/data/seo-clusters | wc -l
git ls-files -- 'apps/web/src/data' | xargs wc -l | sort -rn | sed -n '2,4p'
git diff --stat d8508be -- apps/web/src/components/site/Footer.astro apps/web/src/components/site/Header.astro 'apps/web/src/pages/.well-known/agent-index.json.ts' apps/web/src/pages/about.astro 'apps/web/src/pages/apps/[slug].astro' apps/web/src/pages/apps/index.astro apps/web/src/pages/index.astro 'apps/web/src/pages/og/[slug].svg.ts'
git grep -n "apps\.ts" CLAUDE.md README.md .claude | grep -icE "add|define|edit|centraliz|metadata|single source"
```

In order: `apps.ts` is under 100 lines; the two new directories hold 144 tracked files (129 + 13
entries + 2 index files); the largest file under `apps/web/src/data/` is under 500 lines; the diff
against `d8508be` over the eight importers is **empty**, which is the load-bearing one; and the last
command reports **`0`**.

That last one needs its scope stated, because the obvious narrower grep gets it wrong.
`git grep -c "data/apps\.ts"` over the same paths finds 14 occurrences; `git grep -n "apps\.ts"`
finds 21. The seven it misses are the bare-filename mentions in `.claude/INSTRUCTIONS.md:21,72`,
`.claude/AGENT_REFERENCE.md:69,86,152,153` and `.claude/README.md:98` — and those are exactly the
lines the table above says to rewrite, so a check that cannot see them would report clean over the
work it is meant to verify. Of the 21, **18** pair the path with an instruction to add, edit or
centralize metadata there; that count is what has to reach zero. The other 3 are
`CLAUDE.md:23` (history, which stays true), and `.claude/AGENT_REFERENCE.md:10` and `:153`, which
tell an agent to read or grep the file — those get repointed at the new directory rather than
deleted. `README.md` and `.claude/` may still mention `apps.ts`; none of them may still call it the
place tool metadata is added.

## If stuck

If the mechanical split of the 129 entries turns out to be fiddly — a trailing comment, an entry
whose object boundary the scanner misreads — do `seo-clusters/` first and land it on its own. It is
13 entries, it is the part no candidate layout argues about, and it removes lines 8335-9087 plus the
`push` in one reviewable change. It leaves `apps.ts` at ~8340 lines, which is **still 5.6x the hard
limit**, so it closes nothing on its own and must not be reported as if it did.
