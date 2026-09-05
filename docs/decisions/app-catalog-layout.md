# The layout `apps.ts` becomes

**Status:** decided 2026-09-05. Recorded in the `## Decisions` section of
`docs/architecture/ARCHITECTURE.md`, which is this repo's decision record; this file is the long
argument behind that entry, not a second record.

## Why this file exists, and why it is not in `ARCHITECTURE.md`

The `hexagram` `workflow` skill puts decisions in the `## Decisions` section of
`docs/architecture/ARCHITECTURE.md` and nowhere else, and this repo follows that: every decision on
disk today is a `### ` entry there. There was no `docs/decisions/` directory before this file. The
same skill allows a document written for a specific audience — *"If a proposal needs an audience […]
write that document for that audience. Do not pretend it is the record; the record is here."* This
is that document: it carries per-file measurements, four rejected candidates and an eight-file
migration table, which is more than a decision entry should hold and exactly what the agent
performing the move needs. `ARCHITECTURE.md` gained a short dated entry that states the choice and
points here. The record is still there.

## The two rules, and which one cedes

- **`clean-code`** — the `hexagram` plugin skill, installed at
  `~/.claude/plugins/marketplaces/hexagram/skills/clean-code/SKILL.md`. Line 60, under `## File
  size`: *"**Hard limit:** 1500 lines. Block PRs that create files this large."* Read on the
  installed copy, not quoted second-hand. The section is `SKILL.md:57-66` and carries **no
  exception**; the skill's only `Exceptions:` list is `SKILL.md:53-55`, under `## Function size`,
  and its two entries (many-armed `match`/`switch` arms, generated code) do not reach a file-size
  limit. `apps.ts` is a hand-maintained catalog and would not have qualified for either.
- **`CLAUDE.md:36`** — the line number the pitch cites: *"Keep shared app metadata centralized in
  `apps/web/src/data/apps.ts`."* That rule **ceded** on 2026-09-03. The bullet still exists, reworded
  to defer, and it is now **`CLAUDE.md:42-46`**: it asks for *one import surface* and hands file size
  to the skill. The precedence paragraph added by the same decision is `CLAUDE.md:19`.

Nothing below reopens that. This document answers only the half the ruling left open: **what layout,
and what the eight importers import instead.**

## What is true today, measured on this branch off `d8508be`

```
$ wc -l apps/web/src/data/apps.ts
    9088 apps/web/src/data/apps.ts

$ grep -n 'export const\|^const \|^\];' apps/web/src/data/apps.ts
3:export const apps: AppDefinition[] = [
8333:];
8335:const seoClusterApps: AppDefinition[] = [
9084:];
9088:export const appMap = Object.fromEntries(apps.map((app) => [app.slug, app]));
```

`apps` holds **129** entries (lines 3-8333). `seoClusterApps` holds **13** (8335-9084) and is
**not exported** — line 9086 is `apps.push(...seoClusterApps);`, so the exported `apps` is mutated
after export and reaches every importer with 142 entries. `appMap` is derived on line 9088.

Entry sizes, measured by scanning object boundaries:

```
entries=142  min=57  max=136 (starts line 4)  mean=63.8
```

Per category, across both arrays:

| category | entries | lines |
|---|---:|---:|
| Developer Tools | 54 | 3268 |
| Data Tools | 41 | 2507 |
| Image / Inspection | 26 | 1722 |
| PDF Tools | 15 | 999 |
| YouTube / Data | 6 | 565 |

The eight importers, and what each one does with the catalog:

```
$ git grep -n "data/apps" -- 'apps/web/src'
apps/web/src/components/site/Footer.astro:2:import { apps } from "@/data/apps";
apps/web/src/components/site/Header.astro:2:import { apps } from "@/data/apps";
apps/web/src/pages/.well-known/agent-index.json.ts:2:import { apps } from "@/data/apps";
apps/web/src/pages/about.astro:3:import { apps } from "@/data/apps";
apps/web/src/pages/apps/[slug].astro:5:import { apps, appMap } from "@/data/apps";
apps/web/src/pages/apps/index.astro:3:import { apps } from "@/data/apps";
apps/web/src/pages/index.astro:5:import { apps } from "@/data/apps";
apps/web/src/pages/og/[slug].svg.ts:2:import { apps } from "@/data/apps";
```

| file | what it needs | needs the whole array? |
|---|---|---|
| `components/site/Footer.astro` | groups by category, re-sorts by status then name; `apps.length` in the blurb | yes |
| `components/site/Header.astro` | same grouping; projects a 5-field `searchApps` subset into the client script; `apps.length` | yes |
| `pages/.well-known/agent-index.json.ts` | maps every entry into the services array | yes |
| `pages/about.astro` | `apps.length` only | yes |
| `pages/apps/[slug].astro` | `getStaticPaths` over every slug, `appMap` lookup, related-tool scoring over every entry | yes, plus `appMap` |
| `pages/apps/index.astro` | grouping, `liveApps`, `ItemList` schema over every entry | yes |
| `pages/index.astro` | `apps.length`, per-category counts, `apps.find` for the popular-tools list | yes |
| `pages/og/[slug].svg.ts` | `getStaticPaths` over every slug | yes |

**All eight consume the entire catalog.** No importer reads one tool without reading all of them,
including `[slug].astro`, which uses `appMap` for the current tool *and* scans the whole array to
score related tools.

Two facts that shape the answer:

- **Tree-shaking is not a consideration here.** `apps/web/astro.config.mjs` ends in
  `output: "static"`, and all eight importers are Astro frontmatter or endpoint modules that run at
  build time. `git grep -ln "data/apps" -- 'apps/web/src'` returns no file under `src/tools/`, so no
  React island imports the catalog and none of its 9088 lines reaches a client bundle in any layout.
  The only catalog data that reaches a browser is the hand-projected `searchApps` subset that
  `Header.astro` serializes into the page, and no layout below changes it. A split cannot make the
  site lighter, and a barrel cannot make it heavier.
- **Array order is visible in two places and nowhere else.** `Footer.astro`, `Header.astro` and
  `pages/apps/index.astro` all re-sort with
  `.sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || a.name.localeCompare(b.name))`,
  and the two `getStaticPaths` callers do not care. Source order survives only in the search-overlay
  results in `Header.astro` and in the key order of `agent-index.json`. Cosmetic, but real: a layout
  that reorders the catalog changes shipped output.

## The four candidates

### (a) One module per tool behind a barrel — **chosen**

142 modules of 57-136 lines each, composed by a small surface file. Concretely:

```
apps/web/src/data/apps.ts                    ~20 lines   the import surface: exports apps, appMap
apps/web/src/data/catalog/index.ts          ~135 lines   129 imports + `export const coreApps`
apps/web/src/data/catalog/<slug>.ts          129 files   one AppDefinition each
apps/web/src/data/seo-clusters/index.ts      ~19 lines   13 imports + `export const seoClusterApps`
apps/web/src/data/seo-clusters/<slug>.ts      13 files   one AppDefinition each
```

Every file lands under the 500-line **soft** limit, not just the 1500-line hard one. The largest is
the 136-line `catalog/tubetrace.ts`.

The surface file is the whole migration cost for consumers:

```ts
import type { AppDefinition } from "@smallwebapps/data";
import { coreApps } from "@/data/catalog";
import { seoClusterApps } from "@/data/seo-clusters";

export const apps: AppDefinition[] = [...coreApps, ...seoClusterApps];
export const appMap = Object.fromEntries(apps.map((app) => [app.slug, app]));
```

`[...coreApps, ...seoClusterApps]` reproduces today's runtime order exactly — `apps.push(...)`
appends the clusters after the 129 — so the search overlay and `/.well-known/agent-index.json` render
byte-identically. It also removes the post-export mutation for free: `apps` becomes a value rather
than an array that other modules observe only because module evaluation happened to finish first.

**Does the barrel reintroduce the problem?** No, and the distinction is what the limit is for. The
limit exists so a file is reviewable and a diff inside it is too. A ~135-line index of one-line
imports is reviewable, and it changes only when a tool is added or removed; editing a tool's copy
produces a diff confined to that tool's own module. The barrel is a single **import surface**, which
is what `CLAUDE.md:42` asks for. It is not a single **edit surface**, which is what `clean-code`
forbids. Today's `apps.ts` is both.

Cost, stated plainly: adding a tool goes from touching one file to touching two — the new
`catalog/<slug>.ts` and one import line plus one array member in `catalog/index.ts`. That is a real
regression in the "add a tool" flow and the reason step 1 of `CLAUDE.md`'s five-step procedure has to
be rewritten (below).

**`import.meta.glob` was considered and rejected.** Vite's eager glob would shrink `catalog/index.ts`
to a dozen lines and keep the add-a-tool flow at one file. It loses on three counts: it orders by
filename, which reorders the catalog and changes shipped output for the two order-sensitive
consumers above; it drops the type-checked, greppable list of what is in the catalog; and it makes
plain data depend on a bundler feature for no gain, given that nothing here ships to a client
anyway. `git grep -n "import.meta.glob" apps/web/src` returns nothing today, and this is not the
place to introduce it.

### (b) Split by category — rejected on arithmetic

Five files, and the measured table above says **three of them still breach the hard limit**:
Developer Tools 3268 lines, Data Tools 2507, Image / Inspection 1722. Only PDF Tools (999) and
YouTube / Data (565) would pass. The layout fails the rule it exists to satisfy, and it does so
permanently — Developer Tools is the fastest-growing category. It also makes `category` structural:
retagging a tool becomes a `git mv`, and the category strings are display copy that `Header.astro`
and `pages/apps/index.astro` map to labels and colours. `naming` treats a rename that moves data as
a different, heavier thing than a rename that moves a file, and this turns every one of the former
into the latter for no benefit.

### (c) `seoClusterApps` extracted alone — necessary, insufficient

Lifting lines 8335-9087 leaves 8340 lines in `apps.ts`, still 5.6x the limit. This is the move
slice 1 named as its fallback and it is correct under every candidate, so it is **folded into (a)**
rather than treated as an alternative: `seo-clusters/` is its own directory in the chosen layout,
because it is a separate array with a separate purpose (long-tail SEO variants, all 13 of them noindexed —
`Header.astro:53-56` pushes them out of the menus by hand) and no candidate wants it merged back
into the main catalog. On its own it is not a layout; it is one step of one.

### (d) Astro content collections — rejected as a bigger change than the problem

Verified before opining, not assumed:

```
$ ls apps/web/src
components  data  env.d.ts  lib  pages  styles  tools
$ ls apps/web/src/content apps/web/src/content.config.ts apps/web/content.config.ts apps/web/src/content/config.ts
(no matches)
$ grep -rn "astro:content\|defineCollection" apps/web/src
(no matches)
```

So the repo has **no** `src/content/`, **no** collection config and **no** `astro:content` import
anywhere, while `apps/web/package.json` pins `"astro": "^5.0.0"` — the version whose `glob()` and
`file()` loaders make this straightforward. The capability is available and genuinely unused, which
is why the pitch listed it.

It still loses, on cost rather than on merit:

- **All eight importers change shape, not just their specifier.** `apps` becomes
  `await getCollection("apps")`, returning `{ id, data }` wrappers rather than `AppDefinition`
  objects. Every `app.name`, `app.slug` and `app.category` in the eight files becomes `entry.data.…`
  or needs an unwrapping `.map()`.
- **Four more components follow.** `AppHero.astro`, `AppCard.astro`, `AppGrid.astro` and
  `RelatedApps.astro` all declare `AppDefinition` props (`git grep -n "AppDefinition" apps/web/src`).
  Either every call site unwraps, or all four switch to `CollectionEntry<"apps">`, which couples
  presentational components in `apps/web` to Astro's collection types.
- **The shared type splits in two.** `AppDefinition` is a 66-line hand-written interface in
  `packages/data/src/index.ts`, which `CLAUDE.md` names as the home for shared product types.
  A collection needs a Zod schema. That is either a second definition of the same shape kept in sync
  by hand — the exact failure the single import surface exists to prevent — or `z.infer`, which puts
  a Zod dependency and Astro's data-loading concern inside a package that today has neither.
- **The payoff is for content the catalog does not have.** Collections earn their keep for Markdown
  bodies, and the long-form fields here (`content.deepDive[].body`) are arrays of strings rendered as
  paragraphs, already typed and already validated by TypeScript at build time.

This is the right shape for a future `guides/` or blog surface. It is the wrong price for a
file-size problem that (a) solves without touching a single consumer.

## The choice

**One module per tool behind a barrel, `seoClusterApps` lifted into its own directory as part of the
same move.** It is the only candidate that both satisfies the hard limit for every resulting file and
leaves all eight import statements byte-identical. (b) fails the limit outright, (c) is a step of (a)
rather than a rival, and (d) buys a capability the catalog does not need at the price of rewriting
twelve files and duplicating the shared type.

It also satisfies the reason the limit exists, which is the test slice 1 set: every entry stays
reviewable in a diff, and after the move a one-tool change is a diff of one 60-line file instead of
sixty lines somewhere inside nine thousand.

## What the eight importers import instead

**Nothing changes.** The surface stays at `apps/web/src/data/apps.ts`, so the specifier `@/data/apps`
and both named exports survive the move:

| file | before | after |
|---|---|---|
| `apps/web/src/components/site/Footer.astro:2` | `import { apps } from "@/data/apps";` | `import { apps } from "@/data/apps";` |
| `apps/web/src/components/site/Header.astro:2` | `import { apps } from "@/data/apps";` | `import { apps } from "@/data/apps";` |
| `apps/web/src/pages/.well-known/agent-index.json.ts:2` | `import { apps } from "@/data/apps";` | `import { apps } from "@/data/apps";` |
| `apps/web/src/pages/about.astro:3` | `import { apps } from "@/data/apps";` | `import { apps } from "@/data/apps";` |
| `apps/web/src/pages/apps/[slug].astro:5` | `import { apps, appMap } from "@/data/apps";` | `import { apps, appMap } from "@/data/apps";` |
| `apps/web/src/pages/apps/index.astro:3` | `import { apps } from "@/data/apps";` | `import { apps } from "@/data/apps";` |
| `apps/web/src/pages/index.astro:5` | `import { apps } from "@/data/apps";` | `import { apps } from "@/data/apps";` |
| `apps/web/src/pages/og/[slug].svg.ts:2` | `import { apps } from "@/data/apps";` | `import { apps } from "@/data/apps";` |

This is deliberate and it is why the entries live in `data/catalog/` rather than in a `data/apps/`
directory with an `index.ts`. A directory barrel would also have kept the specifier, but only by
relying on directory-index resolution under `"moduleResolution": "Bundler"`
(`packages/config/tsconfig.astro.json`) *and* on Vite resolving it the same way for `.astro`
frontmatter. Keeping a real `apps.ts` file removes that question instead of testing it, and a
sibling `apps.ts` file next to an `apps/` directory would be ambiguous to read even where it
resolves.

The verification for the move is therefore blunt: `git diff` over the eight files must be empty.

## What happens to `seoClusterApps`

- It becomes `apps/web/src/data/seo-clusters/`: 13 modules plus a 19-line `index.ts` exporting
  `seoClusterApps`.
- It stops being a private `const` that mutates a public export. `apps.ts` composes
  `[...coreApps, ...seoClusterApps]`; line 9086's `apps.push(...seoClusterApps)` disappears.
- The composed order is unchanged, so shipped output is unchanged.
- It stays **out** of `coreApps`. The split is the only structural marker of what these 13 entries
  are, and the codebase already acts on that fact by hand: `Header.astro:53-56` deliberately pushes
  the noindexed size variants ("Compress PDF to 100KB", …) to the back of every menu, and all 13
  cluster slugs are noindexed — verified by matching the 13 against
  `apps/web/src/data/indexing.ts`, where the ten size variants sit in `SIZE_VARIANTS` and
  `keyword-density-checker`, `meta-tags-analyzer` and `open-graph-checker` sit in `COMMODITY`.
  Note that `indexing.ts` keeps its own hand-maintained slug lists and does **not** read the array
  split, so merging the arrays would not break the sitemap filter — it would quietly delete the one
  place in the data that says these entries are a different kind of thing. Reconciling the two
  lists is a separate question this document does not open.

## Does `CLAUDE.md` change again?

**Not now.** The architecture bullet at `CLAUDE.md:42-46` is accurate on this branch: the surface
*is* `apps/web/src/data/apps.ts` today, the bullet already says "Today", and it already calls the
file a standing refactor target. Nothing in this document moves a file, so nothing in that bullet is
false yet.

**After the move, two edits, in the same change as the move.** The path in the architecture bullet
survives; the five-step procedure does not.

`CLAUDE.md:42-46` becomes:

> - Keep shared app metadata behind a single import surface, so 142 tools cannot each invent their
>   own metadata shape. That surface is `apps/web/src/data/apps.ts`, which composes the per-tool
>   modules under `apps/web/src/data/catalog/` and the long-tail variants under
>   `apps/web/src/data/seo-clusters/`. Import the surface, never a tool's module directly.

`CLAUDE.md:68` — step 1 of "Adding or changing tools" — becomes:

> 1. Add `apps/web/src/data/catalog/{slug}.ts` exporting one `AppDefinition`, and register it in
>    `apps/web/src/data/catalog/index.ts`. Long-tail SEO variants go under
>    `apps/web/src/data/seo-clusters/` instead, registered in that directory's `index.ts`.

Five other places restate the old shape and go stale on the same day. They are enumerated, with the
reason each needs a human rather than a `sed`, in the follow-up plan
`docs/plans/app-catalog-size/slice-02-move-the-catalog.md`.
