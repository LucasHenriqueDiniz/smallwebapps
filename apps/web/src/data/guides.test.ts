import { describe, expect, test } from "vitest";
import { guides, guidesForTool, isGuideIndexable, listedGuides, relatedGuides } from "./guides";
import { isIndexableUrl } from "./indexing";

const cut = [
  "browser-based-pdf-tools-safe-and-fast",
  "csv-cleaning-before-import",
  "json-formatting-and-validation",
  "resize-compress-images-locally",
];

describe("guides and the index", () => {
  test("listed is exactly indexable: 4 guides cut on 2026-11-15", () => {
    expect(guides.filter((guide) => !isGuideIndexable(guide.slug)).map((guide) => guide.slug).sort()).toEqual(cut);
    expect(listedGuides.every((guide) => isGuideIndexable(guide.slug))).toBe(true);
    expect(listedGuides).toHaveLength(guides.length - cut.length);
  });

  test("the sitemap filter and the ad gate read the same flag", () => {
    for (const slug of cut) expect(isIndexableUrl(`/guides/${slug}/`)).toBe(false);
    for (const guide of listedGuides) expect(isIndexableUrl(`/guides/${guide.slug}/`)).toBe(true);
    expect(isIndexableUrl("/guides/")).toBe(true);
  });

  test("no related-guides block and no tool page links a cut guide", () => {
    for (const guide of guides) {
      for (const related of relatedGuides(guide.slug)) expect(isGuideIndexable(related.slug), `${guide.slug} → ${related.slug}`).toBe(true);
      for (const listed of guidesForTool(guide.relatedToolSlug)) expect(isGuideIndexable(listed.slug)).toBe(true);
    }
  });

  test("every listed guide still gets at least one related guide", () => {
    for (const guide of listedGuides) expect(relatedGuides(guide.slug).length, guide.slug).toBeGreaterThan(0);
  });
});
