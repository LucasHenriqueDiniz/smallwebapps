---
status: done
kanban: 9ea3ea78-8361-467a-9142-53a230dd748e
---

# Slice 2 — Two more extractions, and CI runs the suite

## Delivers

Two more sibling modules with tests — `statistics-calculator/statistics.ts` and
`case-converter/case.ts` — and a job keyed `test` in `.github/workflows/ci.yml` whose step runs
`pnpm --dir apps/web test --run`, the same invocation slice 1 establishes, so a broken pure function
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

exits 0 and reports 3 test files — 0 exist today, slice 1 adds the first — and

```
grep -nE '^  test:' .github/workflows/ci.yml && grep -n 'run: pnpm --dir apps/web test' .github/workflows/ci.yml
```

exits 0, printing the job key and the step that invokes the suite.

Both greps have to be discriminating, which is why neither of them is just `test`: a bare
`grep -n "test" .github/workflows/ci.yml` already exits 0 on today's file, matching
`runs-on: ubuntu-latest` on line 19, so it would pass with no work done at all. The pair above
exits 1 on today's file.

## If stuck

If either extraction turns out to be entangled with component state — a function that reads a `useState`
value it was declared beside, which the pitch's line counts cannot rule out — skip it and take the
next entry down the density table (`binary-text-converter`, 6 functions in 29 lines). The slice is
"two more modules under test", not those two specific ones. Say in the commit which one was skipped
and why, so the table in the pitch stops being trusted where it is wrong.

## Closed 2026-09-05

Merged in #11 at `a488faa`, with the review fixes at `fba380a`. Three test files, 54 tests, and a
`test` job in `.github/workflows/ci.yml` shaped like the existing `typecheck` job.

The slice's own expectations, against what the code turned out to be:

- **Standard deviation.** The slice predicted the divisor was the likely bug. It was not: the
  implementation was population (`n`) all along, and the old name `stdDev` simply claimed nothing.
  Extracted as `populationVariance` / `populationStandardDeviation`, with the keys `calcStats`
  returns left alone — the Copy button serializes them verbatim, so renaming would change what a
  visitor pastes.
- **Idempotence.** The slice asked for a test that a converted string survives a second pass. That
  is false for `toCamelCase` and `toPascalCase`, which lowercase the whole input first. Pinned, not
  invented.
- Three further defects are pinned rather than fixed, because this is an extraction: quartiles use
  a bare index with no interpolation, `toSnakeCase` deletes hyphens, and `toKebabCase` deletes
  underscores. The first is documented in the published FAQ; the last two are not.

48 mutants were run against the suite. Nine survived the first pass, two of them equivalent; the
other seven are covered.

⚠️ The slice claims the CI job means "a broken pure function fails a pull request". It does not yet:
`main` has no branch protection, so the job reports without blocking.
