import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// The ad slot IDs reach AdSlot.astro only through build-time variables, and the
// owner learns their names from .env.example. When the two disagree, setting
// the documented variable builds a site with that ad unit silently missing:
// that is how the listing slot read PUBLIC_ADSENSE_SLOT_LISTING while the
// example told the owner to set PUBLIC_ADSENSE_SLOT_HOME_LISTING.
const SLOT_VARIABLE = /PUBLIC_ADSENSE_SLOT_[A-Z_]+/g;

function slotVariablesIn(relativePath: string): string[] {
  const text = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  return [...new Set(text.match(SLOT_VARIABLE) ?? [])].sort();
}

describe("ad slot variables", () => {
  test(".env.example documents exactly the slot variables AdSlot.astro reads", () => {
    const read = slotVariablesIn("./AdSlot.astro");
    const documented = slotVariablesIn("../../../.env.example");

    expect(read.length).toBeGreaterThan(0);
    expect(documented).toEqual(read);
  });
});
