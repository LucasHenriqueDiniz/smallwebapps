---
status: done
kanban:
---

# Slice 3 — The home page says what the site is

## Delivers

The home page presents local processing — nothing is uploaded — over the 28 tools that remain linked.
It stops claiming what is not true:

| today | problem | becomes (proposal, owner approves the wording) |
|---|---|---|
| `<title>` "Free Browser Tools for Data and Developers" | the data and developer tools are unlisted after slice 2 | "Private PDF, Image and YouTube Tools That Never Upload Your Files" |
| H1 "Free Tools to Make *{word}* Simple" | says nothing about what the site does | "File tools that never upload your files" |
| sub "PDF, image, developer & AI tools. No uploads. No accounts. No limits." | developer tools gone | "PDF, image and YouTube-history tools that run entirely in your browser. No uploads, no accounts." |
| "Our Most Popular Tools" | 0 clicks in 90 days: there is no popularity to report | "Start here" |
| "Free Tools You'd Usually Pay For" | sales copy | "What runs in your browser, and why it matters" (or removed) |
| hero placeholder `try "json", "image", "csv"` | two of three find nothing after slice 2 | `try "pdf", "image", "youtube"` |
| `siteConfig.description` | check against the 28 | rewritten to match |

The featured cards and quick links come from the indexable set chosen in slice 2, ordered by hand
from it: TubeTrace first, then `pdf-compress`, `image-resize` and `ai-image-checker`. They are not
hard-coded hrefs. `rotating heroWords` either goes or rotates only over verbs the 28 tools do.

## Needs

Slice 2 merged. The owner approves or rewrites the copy in the table **before** this slice merges.

## Tests

- Vitest: every featured and quick-link slug is indexable. This is slice 2's guard extended to the
  hand-ordered list.
- `seo-adsense-validator.sh` passes: title and description present.

## Done when

```bash
pnpm --dir apps/web run build
./.claude/skills/build-validator.sh && ./.claude/skills/seo-adsense-validator.sh && ./.claude/skills/dark-mode-validator.sh
```

all exit 0, and in `apps/web/dist/index.html` the `<title>`, the `<h1>`, the hero subline and the
section headings contain none of `developer`, `json`, `csv`, `most popular` or `usually pay`. The
slice-2 scan script reports this as one more line, so it is a command and not a reading:

```bash
pnpm --dir apps/web run scan:links
```

It reports 0 for the home page copy check, alongside its 0 for links. Guide titles linked from the
home page are not copy and are not checked.

## If stuck

If the owner has not approved the copy, merge the structural part — lists drawn from the indexable
set, the false "Most Popular" heading neutralised — and leave the headline as-is. The review gate in
slice 5 waits for the headline.

## Closed 2026-10-18

Committed in `63d7bb5`. Copy as shipped, against the proposal:

| | proposed | shipped |
|---|---|---|
| title | Private PDF, Image and YouTube Tools That Never Upload Your Files | Private PDF, Image and YouTube Tools That Never Upload Files (60 chars, `SERP_TITLE_LIMIT`) |
| H1 | File tools that never upload your files | same, with "never upload" in the existing highlight |
| popular heading | Start here | Browse the tools ("Start here" sat next to "Four tools to start with") |
| featured heading | What runs in your browser, and why it matters | Four tools to start with (the section is four cards) |

The "Built for developers" card, which listed JSON, CSV and YAML, became "Open source". The
repository is public, as checked with `gh repo view`. The typewriter and its script are gone.

`scan:links` home copy check: **4** stale headings in production, **0** in the build. All three
validators exit 0.
