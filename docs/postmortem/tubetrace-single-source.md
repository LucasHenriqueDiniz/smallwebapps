---
tags:
  - postmortem
  - kind/wrong-claim
  - area/docs
  - dead-code
  - measurement
closed: 2026-09-05
cost: "a pitch, three slices and two decision records, none of which touched the running code"
---

# The TubeTrace epic argued about two copies, and neither one was the tool

> Claim: false · Cost: 1 pitch, 3 slices, 2 decision records, 1 owner decision reversed ·
> smallwebapps@`12fcd0e` · pitch: `docs/pitches/tubetrace-single-source.md`

## What was claimed

`docs/pitches/tubetrace-single-source.md`, opening line: *"`apps/tubetrace/src/` and
`apps/web/src/tools/tubetrace/native/` are the same application twice. Nothing produces one from the
other, and both ship."*

Everything downstream inherited **"both ship"** without checking it:

- three slices — a drift detector, a source decision, a generator — all of which only make sense if
  at least one of the two copies is served;
- a decision record on 2026-09-03 naming `apps/tubetrace/src/` the source and `native/` generated
  output, with a five-row table assigning a disposition to each divergent file;
- a second reading of the owner, also wrong, that made `tubetrace.pages.dev` a shipping product.

## What is actually true

Measured on the branch, not recalled:

| question | command | answer |
|---|---|---|
| does anything import `native/`? | `git grep -n "tools/tubetrace/native" -- apps/web/src` | every hit is a file **inside** `native/` |
| what does the route mount? | `grep -n tubetrace apps/web/src/components/tools/ToolMount.astro` | `:175` mounts `YouTubeWatchHistoryAnalyzerApp`, 544 lines |
| is there a dynamic path in? | `git grep -n "import.meta.glob" -- apps/web` | no output |
| what reaches the browser? | `grep -rl "Dashboard\|UploadSection\|shareCard" apps/web/dist/_astro/` | **zero files**; the island is 14 KB |

So there were never two live copies. There was one live tool of 544 lines, and **two** dead copies
of a different application totalling 23,567 lines. The epic deleted one of them (`apps/tubetrace`,
98 files, 14,882 lines) and the other, `native/`, is still here at 8,685 lines.

The five "divergent" files the 2026-09-03 record catalogued so carefully — `Dashboard.tsx`,
`Footer.tsx`, `Header.tsx`, `UploadSection.tsx`, `shareCard.ts` — are all under `native/`. The table
that assigned each one a rebrand disposition was describing code no user has ever run.

## The mistakes, in the order they were made

1. **`diff -rq` was mistaken for a reachability check.** The pitch measured the two trees against
   each other in four different ways — file counts, line counts, identical/rewrite-only/divergent
   buckets — and every one of those measurements was true. None of them asked whether either tree is
   imported. Precision on the wrong question reads exactly like precision.
2. **"Both ship" was never given a command.** Every other claim in that pitch carries the command
   that produced it, in a table, which is the house style and is why the document reads as
   trustworthy. That one sentence carries none, and it is the one the whole epic rests on.
3. **Three slices were planned on top of it without re-deriving it.** Each slice re-measured the
   thing it needed — the drift detector re-counted the buckets, the generator re-checked the file
   sizes against the `clean-code` limit — and each inherited reachability for free.
4. **An owner decision was recorded backwards.** The 2026-09-03 record has the owner ruling that
   `tubetrace.pages.dev` stays a product. The owner's actual position, stated again on 2026-09-05
   and reported as having been stated before, is that TubeTrace was never separate. A decision
   record is the one document that cannot be reconstructed from the code, so an error in it is
   permanent until someone contradicts it out loud.
5. **The accent fix at `4c8e3a8` was written as if it mattered to users.** Its first message said the
   string *"reaches users — it is the text of the Web Share payload"*. It reaches nobody. Caught in
   review and the message rewritten before merge.

## What worked

- Keeping the superseded record instead of deleting it. Both readings of the owner are now on the
  page, dated, and the reversal is legible. `ARCHITECTURE.md` says this explicitly and it paid off
  the first time it was tested.
- The verification step of the deletion. `pnpm build` was re-run and the `dist` inspected, which is
  what surfaced the 14 KB island and, from it, the whole error.
- Adversarial review as a separate pass. Four of the corrections in this branch — the board
  vocabulary, the Cloudflare header ordering, the untranslated quote, the false claim in a commit
  message — were found by a reviewer with no stake in the implementation, and none of them by the
  implementer.

## What did not

- `status: cancelled` was invented for two slices. The `board` skill's vocabulary is
  `todo | doing | blocked | done`; `sync.py` maps anything else to `todo`, moves the card back into
  the TODO column, and can rewrite the markdown frontmatter to say `todo` on a later run — silently
  undoing the record. Both slices now say `done` with the cancellation in the body.
- A header rule was removed for a reason that was not the real one. `_headers` was said to be
  harmful on a redirect; Cloudflare applies redirects before headers, so the rule was simply dead —
  and it read `noindex, follow`, where `follow` is the opposite of what the commit claimed it did.

## What changed so it cannot recur

| was | is now |
|---|---|
| "both ship", asserted in a pitch with no command behind it | `CLAUDE.md` names `YouTubeWatchHistoryAnalyzerApp.tsx` as what the site serves, and says in bold not to treat `native/` as the tool |
| reachability inherited across three slices from one unverified sentence | the open question is the last section of the 2026-09-05 decision record, where the next reader hits it before planning anything |
| an owner decision recorded from a paraphrase | the reversal is on the page, dated, with the superseded record kept beside it |
| 8,685 unreachable lines with nothing saying they are unreachable | the decision record states it with the four commands that prove it |
| a `status:` value invented per document | the two slices carry the board's own vocabulary, and this postmortem records why |

## Still open

- **Is `native/` an abandoned port or an unfinished one?** 78 files, 8,685 lines, in the typecheck
  (they are most of the 116 hints `astro check` reports) and in no bundle. Deleting it is one
  command; finishing it is the next version of the tool. Owner's call, made nowhere yet.
- **`apps/web/public/tubetrace-favicon.svg` is orphaned** — referenced only from `native/`.
- **Roughly 27 `@radix-ui/*` packages plus `zustand`, `sonner`, `vaul`, `cmdk`,
  `embla-carousel-react`, `input-otp` and `react-resizable-panels`** are plausibly `native/`-only
  dependencies. Not audited one by one; it is the same owner decision's tail.
- **An untracked `apps/web/public/tubetrace-app/` may still exist in a working copy** from before the
  generator was deleted. With the `.gitignore` entry gone it now shows in `git status`, and
  `astro build` copies `public/` into `dist/` — so a deploy from that machine would republish the
  bundle under URLs the new redirects point elsewhere. Delete the directory locally.
