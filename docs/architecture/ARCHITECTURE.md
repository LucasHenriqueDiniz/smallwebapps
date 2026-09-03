# Architecture

`apps/web` is the Small Web Apps Astro site and the primary product: Astro owns routing, SEO pages
and static content, React islands own interactive tool surfaces. `apps/tubetrace` is a second,
separately deployed single-page product whose UI this repo also embeds. The coding rules that shape
all of it are not on disk — they ship as `hexagram` plugin skills, as `CLAUDE.md` explains.

## Decisions

Newest first. A superseded decision stays, marked — knowing why an alternative lost is worth as
much as knowing why the winner won.

### 2026-09-03 — `tubetrace.pages.dev` is the product and the source; the embedded copy is generated

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
- Treating the embed's 8685 lines as hand-written code for review purposes. Once generated, the
  `clean-code` skill's generated-code exception covers them.

**What is deliberately still open.** `pnpm build` runs `sync:tubetrace`, which Vite-builds
`apps/tubetrace` and writes `apps/web/public/tubetrace-app/`. No file under `apps/web/src`
references that path (`git grep -n "tubetrace-app" -- apps/web/src` returns nothing) and
`apps/web/public/_redirects` 301s every path under it away, so that output ships unreachable. Whether
the step is dropped is a build- and deploy-configuration change, and this record does not make it —
it is the remaining question in slice 2 of the plan.

### 2026-09-03 — The `hexagram` plugin outranks this repo's own instruction files

**Context.** `docs/pitches/app-catalog-size.md` documented a collision with no resolution. The
`clean-code` skill (`SKILL.md:60`) reads *"Hard limit: 1500 lines. Block PRs that create files this
large"*, `apps/web/src/data/apps.ts` is 9088 lines — six times that limit and ten times the next
largest file in the repo — and `CLAUDE.md:36` told every agent to keep all shared app metadata in
that one file (line 36 as the pitch cited it; the reworded bullet is now `CLAUDE.md:42`, and the
precedence paragraph this decision added is `CLAUDE.md:19`). Both instructions were live and obeyed. Neither `clean-code` exception applies:
`apps.ts` is a hand-maintained catalog, not generated code and not a many-armed `switch`.

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
