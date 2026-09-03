---
status: todo
kanban: 9ea3ea78-8361-467a-9142-53a230dd748e
---

# Slice 2 — Two more extractions, and CI runs the suite

## Delivers

Two more sibling modules with tests — `statistics-calculator/statistics.ts` and
`case-converter/case.ts` — and a `test` job in `.github/workflows/ci.yml`, so a broken pure function
fails a pull request instead of a local command nobody runs.

`statistics-calculator` is chosen because a wrong percentile is the exact silent-failure shape the
pitch describes. `case-converter` is chosen because its six functions are 28 lines total, so the
slice has one cheap half and one that earns its keep.

## Needs

- Slice 1 merged: the runner, the vitest config and the extraction pattern all come from it.
- 15 minutes reading `.github/workflows/ci.yml`, which currently has one `typecheck` job and a
  comment explaining why there is no build job. The new job follows its shape — `pnpm/action-setup@v4`
  with no version pin, `node-version-file: .nvmrc`.

## Tests

`statistics.ts`:

- mean, median and mode against a hand-computed fixture
- median of an even-length list averages the two middle values
- standard deviation states in its name whether it is population or sample, and the test asserts
  that one — the divisor is the bug this file is most likely to have
- an empty input returns whatever the component already renders for it, and the test pins that
  rather than inventing a new contract

`case.ts`:

- each conversion against a string containing a hyphen, an underscore, a space and a capital, so the
  separators are actually exercised
- an already-converted string is unchanged by a second pass

Same bar as slice 1: a test that survives the function being stubbed out is rewritten.

## Done when

```
pnpm --dir apps/web test --run
```

exits 0 and reports 3 test files, and

```
grep -n "test" .github/workflows/ci.yml
```

shows the suite invoked as a job step.

## If stuck

If either extraction turns out to be entangled with component state — a function that reads a `useState`
value it was declared beside, which the pitch's line counts cannot rule out — skip it and take the
next entry down the density table (`binary-text-converter`, 6 functions in 29 lines). The slice is
"two more modules under test", not those two specific ones. Say in the commit which one was skipped
and why, so the table in the pitch stops being trusted where it is wrong.
