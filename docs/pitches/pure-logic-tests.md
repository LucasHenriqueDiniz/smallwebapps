---
status: active
epic: tests
---

# There is no test runner, and the logic worth testing is trapped in components

## What is actually true

Measured on `origin/main` at `fdfed01`:

```
git ls-files | grep -iE '\.(test|spec)\.|__tests__|/tests?/|vitest|jest'   -> no output, exit 1
git grep -n '"test"\|vitest\|jest\|playwright' -- '*/package.json' 'package.json'  -> no output, exit 1
```

Not a placeholder suite, not a stale one: nothing. CI runs `pnpm run check` (`astro check`) and
`pnpm run typecheck:tubetrace` (`tsc --noEmit`) and that is the whole of it.

The second half of the problem is where the testable code lives:

```
git ls-files 'apps/web/src/tools/**/*.ts' | grep -v tubetrace   -> no output
```

**Zero** non-component TypeScript modules across 94 tool directories. Every pure transformation in
the product sits inside a `*App.tsx`, unexported, above the first hook. The densest cases:

| file | pure functions before the first hook | lines |
|---|---|---|
| `simple-utilities/SimpleUtilityApp.tsx` | 17 | 359 |
| `dummy-data-generator/DummyDataGeneratorApp.tsx` | 8 | 53 |
| `binary-text-converter/BinaryTextConverterApp.tsx` | 6 | 29 |
| `case-converter/CaseConverterApp.tsx` | 6 | 28 |
| `color-converter/ColorConverterApp.tsx` | 5 | 87 |

`ColorConverterApp.tsx` is the clearest: `hexToRgb`, `rgbToHsl`, `rgbToHsv`, `rgbToCmyk` and
`parseAnyColor` occupy lines 3–94, none of them exported, and the component begins at line 95.

## Why this is the step that pays

The architecture audit's verdict was `nao-se-aplica` — no hexagon step pays for itself in a
browser-only Astro site with no ports to invert. What does pay is the thing the hexagon would have
bought for free: a pure module sitting beside the component that renders it, exported, and covered
by tests that need no DOM.

These are exactly the functions where a wrong answer is silent. A colour conversion that is off by
one in the hue channel renders a plausible swatch; a percentile that picks the wrong index returns
a plausible number. `astro check` cannot see either. That is what the missing runner costs.

## Scope

Two slices. The first installs `vitest` in `apps/web` and proves it on one extracted module, so the
runner arrives with something real in it rather than as a config commit. The second extracts two
more of the dense cases.

Not in scope: a coverage target, a component-testing setup, browser or end-to-end tests. The
`testing` skill's rule against placeholder tests cuts both ways — a runner installed with nothing
in it is the placeholder.
