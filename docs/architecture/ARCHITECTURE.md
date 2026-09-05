# Architecture

`apps/web` is the Small Web Apps Astro site and the only product this repo builds: Astro owns
routing, SEO pages and static content, React islands own interactive tool surfaces. The coding rules
that shape all of it are not on disk — they ship as `hexagram` plugin skills, as `CLAUDE.md`
explains.

## Decisions

Newest first. A superseded decision stays, marked — knowing why an alternative lost is worth as
much as knowing why the winner won.

### 2026-09-05 — The app catalog becomes one module per tool behind a barrel

**Context.** The 2026-09-03 ruling below bound `apps/web/src/data/apps.ts` to `clean-code`'s
1500-line hard limit and left the layout open. Measured on this branch off `d8508be`: 9088 lines,
**129** entries in `apps` (lines 3-8333), **13** in `seoClusterApps` (8335-9084, not exported,
merged into `apps` by `apps.push(...)` on line 9086), `appMap` on 9088; entries run 57-136 lines,
mean 63.8. All eight importers under `apps/web/src` consume the entire array.

**Decision.** The import surface stays at `apps/web/src/data/apps.ts`, which shrinks to ~20 lines and
composes `[...coreApps, ...seoClusterApps]`. The 129 entries become one module each under
`apps/web/src/data/catalog/`, registered in a ~135-line `catalog/index.ts`; the 13 long-tail variants
become `apps/web/src/data/seo-clusters/` with its own index, and stay a separate array. **All eight
import statements are unchanged, byte for byte** — that is the point of keeping a real `apps.ts`
rather than a directory barrel.

**What this rules out.** Splitting by category, which the measurements kill outright: three of the
five files would still breach the hard limit (Developer Tools 3268 lines, Data Tools 2507, Image /
Inspection 1722). Extracting `seoClusterApps` alone, which leaves 8340 lines and is folded into the
move as one of its steps rather than treated as a layout. Astro content collections, available since
the repo runs `astro@^5` and genuinely unused here (no `src/content/`, no collection config, no
`astro:content` import anywhere) — rejected because it changes the shape all eight importers and the
four `AppDefinition`-typed components see, and duplicates the 66-line shared interface in
`packages/data/src` as a Zod schema. Also `import.meta.glob`, which would order the catalog by
filename and change shipped output.

**The long argument, the four candidates costed one by one, the before/after import table for all
eight files, and the new `CLAUDE.md` wording: `docs/decisions/app-catalog-layout.md`.** The move
itself is `docs/plans/app-catalog-size/slice-02-move-the-catalog.md`. Until it lands, `apps.ts` is
still the single file and the six prose files that say so are still describing the truth.

### 2026-09-05 — TubeTrace is a tool of this site, and `apps/tubetrace` is deleted

**Context.** The 2026-09-03 record below — *`tubetrace.pages.dev` is the product and the source*
— read the owner as ruling that
`tubetrace.pages.dev` stays a shipping product and is the source of the embedded copy. The owner has
since said — and says it was said before — that TubeTrace should not be something separate: it is
just a tool. So the option that record listed under **What this rules out** —
*"Deleting `apps/tubetrace` and the `tubetrace` Cloudflare project"* — is the actual decision, and
everything the 2026-09-03 record built on top of the other reading falls with it.

**Decision.** TubeTrace is one of the tools of Small Web Apps, no different from the other 141. It
has one slug, `tubetrace`; one route, `/apps/tubetrace`; one implementation directory,
`apps/web/src/tools/tubetrace/`. Therefore:

- **`apps/web/src/tools/tubetrace/` is the only copy of TubeTrace in this repo, and it is
  hand-maintained source.** Measured at `d6ee4bb`: 79 tracked files, 9229 lines. It is reviewed as
  ordinary code, under the same `clean-code` limits as everything else — which it meets: the largest
  file is 728 lines (`native/components/ui/sidebar.tsx`) against a 1500-line hard limit, and 3 of the
  79 pass the 500-line soft limit. **Read that with the last section of this record**, which is the
  part worth reading twice: 78 of those 79 files sit under `native/` and are not what the site
  serves. "Hand-maintained source" describes their status, not their usefulness.
- **Of those 79 files, only one ships.** `ToolMount.astro:175` mounts
  `YouTubeWatchHistoryAnalyzerApp.tsx` — 544 lines, importing `react` and `fflate` and nothing else.
  The other 78 files, the whole 8685-line `native/` tree, are imported by nothing outside themselves:
  `git grep -n "tools/tubetrace/native" -- apps/web/src` returns hits only from inside `native/`, and
  the built island `dist/_astro/YouTubeWatchHistoryAnalyzerApp.*.js` is 14 KB with no `Dashboard`,
  `UploadSection` or `shareCard` in it. `astro check` typechecks the tree; the bundler drops all of
  it. This is measured here and settled nowhere — see below.
- **There is no second source, no generator and no drift.** Nothing has to be kept in step with
  anything, so nothing has to detect that it drifted.
- **There is no second domain.** The canonical URL of this tool is
  `https://smallwebapps.com/apps/tubetrace/`, produced by `ToolLayout.astro` like every other tool
  page. Nothing inside the React island sets a canonical of its own — measured, a `git grep -n` for
  `tubetrace.pages.dev` over `apps/web/src` returns nothing, and the only absolute URLs left under
  `apps/web/src/tools/tubetrace/` are two links to the upstream GitHub repository and two to
  `takeout.google.com`, which are ordinary outbound links and stay.
- **`apps/tubetrace` leaves the repository**, and with it `scripts/prepare-tubetrace-embed.mjs`, the
  `apps/web/public/tubetrace-app/` output, the four root `*:tubetrace` scripts, `pnpm sync:tubetrace`
  at the front of `build`, and the CI typecheck step. That closes the question the 2026-09-03 record
  left open under **What is deliberately still open** — the build step that published a bundle no
  page loads is gone, because the workspace it built is gone.

**This PR changes nothing in Cloudflare.** It stops producing and publishing the bundle; the
`tubetrace` Pages project keeps running until the owner switches it off, which is an action outside
this repository. Note the consequence while it does: `tubetrace.pages.dev` still serves the app from
whatever it last deployed, and this repo no longer contains the code behind it.

**What this rules out.**

- A generator, in either direction, and the drift detector that was to verify it. Both were answers
  to a two-copy problem that no longer exists.
- Treating `apps/web/src/tools/tubetrace/native/` as generated output. It is hand-written code and
  gets reviewed as such.
- Reading the rebrand as a patch set. The Small Web Apps wordmark, footer links, favicon, share-card
  strings and the `useState` → effect move for the locale guess in `native/components/UploadSection.tsx`
  stop being a diff against an upstream, because there is no upstream left to reconcile them with.
  They are not "what the tool says" either — all five of those files are under `native/`, which the
  last section of this record shows the site never loads. They are what a dead copy says, and the
  open question there decides whether they mean anything at all.

**What is lost, and where to find it.** `apps/tubetrace` was 98 tracked files and 14882 lines. It is
not gone, it is in git: **`d8508be`** is the last commit that carries it, and
`git show d8508be:apps/tubetrace/...` reads any file of it back.

**What this opens, and does not answer.** The whole epic — the pitch, all three slices and both
decision records — argued about which of two copies of the TubeTrace UI is the source, and none of
them checked whether either copy is on the site. Neither is. `native/` is 8685 unreferenced lines,
and the tool users actually get is a 544-line file that shares no code with it. So the deletion above
removed one dead copy and left another, and the real question was never the one being asked:
**is `native/` an abandoned port, or an unfinished one somebody means to land?** That is an owner
call — an abandoned port is 78 files to delete, an unfinished one is the next version of the tool —
and it is not made here. Until it is, `native/` stays, and the `?`-for-`ó` fix at `d6ee4bb` is a fix
to code that compiles and ships to nobody.

### 2026-09-03 — `tubetrace.pages.dev` is the product and the source; the embedded copy is generated

> **Superseded 2026-09-05** by *TubeTrace is a tool of this site, and `apps/tubetrace` is deleted*,
> above. The owner's ruling was the opposite of what this record captured: TubeTrace was never a
> separate product. The alternative this record rules out below is the one that won. Kept as
> written, because the measurements in it are correct and the reasoning is why the wrong branch
> looked right.

**Context.** `docs/pitches/tubetrace-single-source.md` established that the TubeTrace UI exists
twice with nothing producing one from the other. Re-measured on this branch, off `19367d6`:
`apps/web/src/tools/tubetrace/native/` is 78 tracked files and 8685 lines, and classifying each
file against its twin in `apps/tubetrace/src/` gives **11 byte-identical, 62 differing only by the
`@/` ↔ `@/tools/tubetrace/native/` import rewrite, and 5 genuinely divergent**. `apps/tubetrace` is
its own deployed product: it has `wrangler.toml`, a `deploy` script targeting the Cloudflare project
`tubetrace`, and canonical URLs on `tubetrace.pages.dev` in six tracked files. Which of the two
copies is the source was a product call about a second domain, so no agent could make it.

**Decision.** The owner ruled that `tubetrace.pages.dev` stays a shipping product and is the
original. Small Web Apps carries **one tool that imitates TubeTrace** — the embedded copy is
derived, not a peer. Therefore:

- `apps/tubetrace/src/` is the single source of the TubeTrace UI.
- `apps/web/src/tools/tubetrace/native/` becomes **generated output**. It stops being maintained by
  hand.
- The generator runs **`apps/tubetrace/src/` → `apps/web/src/tools/tubetrace/native/`**, one
  direction only. A fix to shared behaviour lands upstream in `apps/tubetrace/src/` and reaches the
  embed by regeneration.
- `tubetrace.pages.dev` keeps its canonical URLs. They belong to the product that is now the
  source, and nothing about this decision changes what that product publishes.

**The five divergent files.** All five are intended, all five stay as a recorded patch the
generator applies after the import rewrite — none is deleted, and none of it is drift to erase
except one string:

| file | why it differs | disposition |
|---|---|---|
| `components/Dashboard.tsx` | Small Web Apps wordmark in place of the TubeTrace one | rebrand patch |
| `components/Footer.tsx` | Small Web Apps footer links | rebrand patch |
| `components/Header.tsx` | Small Web Apps wordmark and favicon | rebrand patch |
| `components/UploadSection.tsx` | rebrand (`"TubeTrace."` → `"YouTube Watch History Analyzer"`, `/favicon.svg` → `/tubetrace-favicon.svg`) **plus** the locale guess moved out of the `useState` initializer into an effect | rebrand patch, and the SSR fix stays a patch until somebody decides whether to upstream it — reading `navigator.language` in an initializer is unsafe under prerendering, which is why `apps/web` needed the change and the standalone Vite SPA never did |
| `lib/shareCard.ts` | share-card title, filename and footer domain rebranded | rebrand patch, **with one correction**: line 108 in the embed reads `"Meu hist?rico do YouTube analisado localmente"` where the source has `"Meu histórico do YouTube analisado no TubeTrace"`. `localmente` for `no TubeTrace` is the rebrand and stays; the literal `?` for `ó` is an encoding loss from the hand copy and the generated file must not reproduce it |

**What this rules out.**

- Editing anything under `apps/web/src/tools/tubetrace/native/` by hand once the generator exists.
- The reverse direction. Regenerating `apps/tubetrace/src/` from the embed would overwrite the
  original product with its own rebranded derivative.
- Deleting `apps/tubetrace` and the `tubetrace` Cloudflare project, which was the other live option
  in `docs/plans/tubetrace-single-source/slice-02-decide-the-source.md`.
- Treating the embed's 8685 lines as hand-written code for review purposes. Note what the plugin
  does **not** say here. In `hexagram/skills/clean-code/SKILL.md` the only `Exceptions:` list is
  `SKILL.md:53-55`, under `## Function size`, and generated code is one of its two entries;
  `## File size` (`SKILL.md:57-66`) carries no exception at all. Generated status therefore excuses
  the function bodies from the 80/200-line limits and nothing else — there is no file-size exception
  to invoke. None is needed either: measured on this branch, the largest file under `native/` is 728
  lines (`components/ui/sidebar.tsx`) against a 1500-line hard limit, and only 2 of the 78 pass the
  500-line soft limit.

**What is deliberately still open.** `pnpm build` runs `sync:tubetrace`, which Vite-builds
`apps/tubetrace` and writes `apps/web/public/tubetrace-app/`. Nothing consumes it: a
`git grep -n` over `apps/web/src` for `tubetrace-app`, `embed.js` and `embed.css` returns nothing
for all three. But it ships **reachable and unreferenced**, not unreachable.
`apps/web/public/_redirects:6-12` is seven exact paths with no wildcard — `/tubetrace-app/`,
`/index.html`, `/privacy`, `/privacy.html`, `/terms`, `/terms.html`, `/sitemap.xml` — and those are
the standalone-shell files `scripts/prepare-tubetrace-embed.mjs:51-70` already deletes. What the
script keeps on purpose — `embed.js`, `embed.css` and `assets/*`, under the comment at
`prepare-tubetrace-embed.mjs:50`, *"Only the embed payload is worth keeping"* — is redirected by
nothing and is publicly fetchable, covered only by `X-Robots-Tag: noindex, follow` at
`apps/web/public/_headers:16`. The step therefore publishes a bundle no page loads. Whether it is
dropped is a build- and deploy-configuration change, and this record does not make it — it is the
remaining question in slice 2 of the plan.

### 2026-09-03 — The `hexagram` plugin outranks this repo's own instruction files

**Context.** `docs/pitches/app-catalog-size.md` documented a collision with no resolution. The
`clean-code` skill (`SKILL.md:60`) reads *"Hard limit: 1500 lines. Block PRs that create files this
large"*, `apps/web/src/data/apps.ts` is 9088 lines — six times that limit and ten times the next
largest file in the repo — and `CLAUDE.md:36` told every agent to keep all shared app metadata in
that one file (line 36 as the pitch cited it; the reworded bullet is now `CLAUDE.md:42`, and the
precedence paragraph this decision added is `CLAUDE.md:19`). Both instructions were live and
obeyed. And the size limit is unconditional: `## File size` (`SKILL.md:57-66`) lists no exception,
and the skill's only `Exceptions:` list (`SKILL.md:53-55`) sits under `## Function size`, so neither
of its two entries — many-armed `match`/`switch` arms, and generated code — reaches a file-size
limit at all. `apps.ts` would not have qualified anyway: it is a hand-maintained catalog.

**Decision.** The owner ruled that the plugin chooses — everything follows the `hexagram` skills.
So `clean-code`'s 1500-line hard limit binds `apps.ts` with no exception, the centralization rule
cedes, and `CLAUDE.md` has been reworded to **defer**: it now states the requirement it actually
cares about — one import surface for app metadata — and leaves file size to the skill, instead of
naming a single file as the permanent home. The precedence itself is written into `CLAUDE.md` so the
next collision resolves without asking.

**What this rules out.**

- Granting `apps.ts` a named size exception, which was the other branch slice 1 of
  `docs/plans/app-catalog-size/` was written to allow.
- Any rule in `CLAUDE.md`, `AGENTS.md` or `.claude/` that restates, narrows or overrides a plugin
  skill. Where the two collide the plugin wins.
- Reading "centralized" as "one file". Centralization survives as a single import surface; the
  layout behind it is free.

**What it does not settle.** Which layout `apps.ts` becomes — one module per tool behind a barrel, a
split by category, `seoClusterApps` (lines 8335–9087) lifted out on its own, or Astro content
collections — and what the eight current importers under `apps/web/src` import instead. That is now
ordinary engineering under a binding limit rather than a rule conflict, and it is the remaining work
in `docs/plans/app-catalog-size/slice-01-settle-the-rule.md`. Until it lands, `apps.ts` is still the
single file and the `.claude/` quick-reference docs that say so are still describing the truth.
