---
status: active
epic: catalog
---

# The house rule and this repo's own rule disagree about apps.ts

> **Decided 2026-09-03.** The plugin wins: `clean-code`'s 1500-line limit binds and `CLAUDE.md`
> now defers to it instead of naming a permanent home for the catalog. The layout is still open.
> The argument below stands as written; the record is the `## Decisions` section of
> `docs/architecture/ARCHITECTURE.md`.

## What is actually true

```
git ls-files -- '*.ts' '*.tsx' '*.astro' '*.mjs' | xargs wc -l | sort -rn | head -3
   9088 apps/web/src/data/apps.ts
    907 apps/web/src/components/site/Header.astro
    885 apps/web/src/pages/index.astro
```

`apps.ts` is **6x the hard limit and 10x the next largest file in the repo**. It holds
`export const apps: AppDefinition[]` with 142 entries (line 3 to ~8334), a second array
`seoClusterApps` (line 8335), and `appMap` (line 9088). Eight files under `apps/web/src` import from
it.

Two rules apply and they point opposite ways:

- `clean-code` skill, line 60: *"Hard limit: 1500 lines. Block PRs that create files this large."*
  Its listed exceptions are many-armed `match`/`switch` blocks and generated code. This is neither —
  it is a catalog maintained by hand.
- This repo's `CLAUDE.md:36`: *"Keep shared app metadata centralized in `apps/web/src/data/apps.ts`."*

Both are real instructions, currently obeyed, and cannot both stay as written.

## Why it is not obvious which cedes

The centralization rule is not decoration. `CLAUDE.md` makes step 1 of adding a tool "add or update
metadata in `apps/web/src/data/apps.ts`", and the tool pages are data-driven through
`apps/web/src/pages/apps/[slug].astro` — a single import is what keeps 142 tools from each
inventing their own metadata shape. Splitting it into 142 files satisfies the line count and can
easily lose that.

Equally, the file-size rule exists because a 9088-line file is not reviewable, and a diff inside it
is not either.

There are several shapes that satisfy both — one file per tool re-exported through a barrel, a
split by category, `seoClusterApps` moved out on its own, or moving the content out of TypeScript
into content collections, which Astro already provides and which this repo does not use for this
data. Each one trades differently against the AdSense-driven content requirements in the "Tool page
contract" section of `CLAUDE.md`.

That is a call for the owner. This pitch does not make it; it states it, so it stops being an
unwritten contradiction that every agent rediscovers.

## Scope

One slice, blocked. Nothing is refactored until the rule conflict is settled in writing, because a
9088-line refactor done under the wrong rule is worse than the file.
