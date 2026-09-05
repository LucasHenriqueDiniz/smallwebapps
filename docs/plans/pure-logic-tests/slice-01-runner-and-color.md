---
status: done
kanban: 5cb926ee-34a0-431f-b9b3-af341fdcdfb5
---

# Slice 1 — A runner, arriving with one real module in it

## Delivers

`pnpm --dir apps/web test` runs and passes. It runs against
`apps/web/src/tools/color-converter/color.ts` — a new module holding the five functions currently
private to `ColorConverterApp.tsx` lines 3–92 (`hexToRgb`, `rgbToHsl`, `rgbToHsv`, `rgbToCmyk`,
`parseAnyColor`), now exported — and `color.test.ts` beside it. `ColorConverterApp.tsx` imports them
instead of declaring them, and renders identically.

Colour conversion is the first target because its expected values are checkable against a source
outside this repo, so the tests assert arithmetic rather than restating the implementation.

## Needs

- `vitest` as a devDependency of `apps/web` only. Not the root, not the catalog: `apps/tubetrace` is
  under a separate decision (`tubetrace-single-source`) and must not gain a dependency while that is
  open.
- `apps/web` is an Astro project with a Vite config underneath, so vitest needs the `@/` alias
  resolved the same way Astro resolves it. Budget 30 minutes on `vitest.config.ts` reusing
  `tsconfig.json`'s `paths`.
- Nothing from the tubetrace plan.

## Tests

The list is the definition of done:

- `hexToRgb` — `#ffffff` gives `[255,255,255]`; a leading `#` is optional; `#ggg`, `#ff` and the
  3-digit `#fff` all give `null`. Its regex matches six digits only; the shorthand expansion lives in
  `parseAnyColor` (lines 53–58), and this slice moves both functions as they are rather than widening
  either one
- `rgbToHsl` — pure red is `[0,100,50]`; grey has saturation `0`; hue wraps correctly across the
  red boundary rather than going negative
- `rgbToHsv` — black is `[0,0,0]`; pure red is `[0,100,100]`
- `rgbToCmyk` — black gives `k = 100`; white gives `[0,0,0,0]`
- `parseAnyColor` — accepts the hex, `rgb()` and `hsl()` forms the component's input box accepts, with
  `#fff` and `#ffffff` both giving `[255,255,255]`, and returns `null` for text that is not a colour
- one round-trip: for a fixed table of hex values, `rgbToHsl` then back is within one unit per
  channel

Each of these fails against a deliberately broken implementation. A test that still passes when the
function is replaced by `return [0,0,0]` does not count and is rewritten.

## Done when

```
pnpm --dir apps/web test --run
```

exits 0 and its summary line names at least 6 passing tests in `src/tools/color-converter/color.test.ts`, and

```
pnpm run check
```

still exits 0, proving `ColorConverterApp.tsx` compiles against the extracted module.

## If stuck

If wiring the `@/` alias into vitest inside an Astro project costs more than the 30-minute budget,
import the module by relative path in the test (`./color`) and leave the alias for later. The test
proves the arithmetic either way, and the alias is a config problem, not a testing one.

If vitest and Astro's Vite version conflict outright, fall back to `node --test` with `tsx`. It is
worse ergonomics and no watch mode, but the point of this slice is that a wrong colour conversion
fails a command — not which runner prints the failure.

## Closed 2026-09-05

Merged in #11 at `1bff42b`. `vitest` is a devDependency of `apps/web` alone, `vitest.config.ts`
derives the `@/` alias from `tsconfig.json`'s own `paths` rather than restating it, and the five
functions moved to `color-converter/color.ts` unchanged apart from `export`.

The slice asked for at least 6 tests in `color.test.ts`; it landed with 25, and the commit was
verified green on its own in a detached checkout before slice 2 existed.

Two things the slice did not anticipate, both recorded in #11:

- `returns null for text that is not a color` passed for the wrong reason. Under vitest's `node`
  environment `document` is undefined, so `parseAnyColor`'s canvas branch throws and the `catch`
  answers. In a browser that branch runs and returns `[0, 0, 0]`, because assigning an invalid
  value to `ctx.fillStyle` is a no-op. The test now says what it pins; the product bug it was
  hiding is filed separately.
- `#fff` cannot prove the three-digit hex expansion — a repdigit is identical whether each
  character is doubled or the whole string is repeated. The fixture is `#abc`.
