---
status: blocked
kanban: 6f320ad9-93df-48ce-85ca-63f7d1c03047
---

# Slice 2 — Decide which TubeTrace copy is the source

**Blocked on the owner: only he can decide whether `tubetrace.pages.dev` stays a shipping product.**
Every technical route below is cheap; choosing between them is a product call about a second
domain, and no agent can make it. Unblock by answering the question in "The question" and recording
the answer here.

## Delivers

`docs/decisions/tubetrace-source-of-truth.md` — a decision record naming one directory as the
source, saying what the other becomes, and listing what the choice rules out. Nothing else in this
plan can be built before it, because the generator in slice 3 runs in whichever direction this
picks.

## Needs

- Slice 1 merged, so the decision argues over measured numbers rather than an impression.
- The owner's answer. There is no time budget on this one; it is not reading, it is a choice.

## The question

`apps/tubetrace` is a separately deployed product, not just a source directory:

- `apps/tubetrace/wrangler.toml` exists
- `apps/tubetrace/package.json` has `"deploy": "… wrangler pages deploy ./dist/public --project-name=tubetrace"`
- `git grep -l "tubetrace.pages.dev" -- apps/tubetrace` returns five tracked files
- `.github/workflows/ci.yml` records that Cloudflare Pages builds both apps on every push

Meanwhile its build output is dead inside `apps/web`: `pnpm build` runs `sync:tubetrace`, which
writes `apps/web/public/tubetrace-app/`, and no source file under `apps/web/src` references that
path while `apps/web/public/_redirects` 301s every path under it away.

So: **does `tubetrace.pages.dev` stay a product?**

- **If yes** — the two copies are two products sharing a UI, `apps/tubetrace/src` is the source, and
  `native/` becomes generated output with the rebrand applied as a documented patch set.
- **If no** — `apps/tubetrace` is deleted along with `sync:tubetrace`, the `tubetrace-app` build
  step, the `_redirects` block and the `_headers` block, `native/` becomes the only copy and stops
  being a fork at all.

## Tests

A decision record is prose; its check is that the next slice can be started from it without asking
another question. Concretely, it must state:

- which directory is the source
- what happens to `sync:tubetrace` and `apps/web/public/tubetrace-app/`
- whether `tubetrace.pages.dev` keeps its canonical URLs
- the five divergent files: which of them are intended rebrand and stay as patches, and which are
  drift to be erased (`lib/shareCard.ts:108` in `native/` carries `"Meu hist?rico"` where the source
  has `"Meu histórico"` — that one is drift, not rebrand)

## Done when

```
ls docs/decisions/tubetrace-source-of-truth.md && grep -c "^## " docs/decisions/tubetrace-source-of-truth.md
```

lists the file and reports at least 4 sections, and

```
grep -n "tubetrace.pages.dev" docs/decisions/tubetrace-source-of-truth.md
```

returns at least one line — i.e. the record answers the domain question rather than skipping it.

## If stuck

If the owner will not decide now, do not guess and do not start slice 3. Ship the smaller
independent fix instead: correct `"Meu hist?rico"` to `"Meu histórico"` in
`apps/web/src/tools/tubetrace/native/lib/shareCard.ts:108`. It is a real user-visible defect in the
copy that ships, and it is correct under either answer.
