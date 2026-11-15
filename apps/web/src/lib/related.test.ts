import { describe, expect, test } from "vitest";
import { apps, appMap } from "@/data/apps";
import { isIndexable } from "@/data/indexing";
import { relatedTools } from "./related";

const pdfOcr = appMap["pdf-ocr"];

// An unlisted tool dressed up to be the best possible match for pdf-ocr:
// same category, every tag shared, live. Score alone would put it first.
const unlistedTwin = {
  ...appMap["json-formatter"],
  category: pdfOcr.category,
  tags: [...pdfOcr.tags],
  status: "live" as const,
  implemented: true,
};

describe("relatedTools", () => {
  test("never returns an unlisted tool, even one that would win on score", () => {
    expect(isIndexable(unlistedTwin.slug)).toBe(false);
    const related = relatedTools(pdfOcr, [unlistedTwin, ...apps]);
    expect(related.map((app) => app.slug)).not.toContain(unlistedTwin.slug);
  });

  test("returns only listed tools for every tool page in the catalog", () => {
    for (const app of apps) {
      for (const item of relatedTools(app, apps)) expect(isIndexable(item.slug)).toBe(true);
    }
  });

  test("puts the same category first and leaves the tool itself out", () => {
    const related = relatedTools(pdfOcr, apps);
    expect(related.map((app) => app.slug)).not.toContain("pdf-ocr");
    const same = related.map((app) => app.category === pdfOcr.category);
    expect(same[0]).toBe(true);
    // once a tool from another category appears, none from the same one follows
    expect(same.slice(same.indexOf(false) >= 0 ? same.indexOf(false) : same.length)).not.toContain(true);
  });

  test("gives a page in an unlisted category tools from elsewhere, not nothing", () => {
    const related = relatedTools(appMap["json-formatter"], apps);
    expect(related.length).toBeGreaterThan(0);
  });
});
