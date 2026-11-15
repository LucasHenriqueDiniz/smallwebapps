import { describe, expect, test } from "vitest";
import { appMap } from "./apps";
import { featuredSlugs, heroQuickSlugs, popularSlugs } from "./home";
import { isIndexable } from "./indexing";
import { listedApps, listedCategories, listedInCategory } from "./listed";

describe("listed tools", () => {
  test("are exactly the indexable tools: 28 on 2026-10-18, 5 since 2026-11-15", () => {
    expect(listedApps.every((app) => isIndexable(app.slug))).toBe(true);
    expect(listedApps.map((app) => app.slug).sort()).toEqual([
      "exif-viewer", "image-to-text", "pdf-ocr", "searchable-pdf", "tubetrace",
    ]);
  });

  test("leave out every category that has nothing indexable", () => {
    expect(listedCategories).toEqual(["PDF Tools", "Image / Inspection", "YouTube / Data"]);
  });

  test("group back into the same set by category", () => {
    const grouped = listedCategories.flatMap((category) => listedInCategory(category));
    expect(grouped).toHaveLength(listedApps.length);
  });
});

describe("home page picks", () => {
  test.each([
    ["hero quick links", heroQuickSlugs],
    ["featured cards", featuredSlugs],
    ["popular grid", popularSlugs],
  ])("%s name only listed tools", (_, slugs) => {
    for (const slug of slugs) {
      expect(appMap[slug], `${slug} is not in the catalog`).toBeDefined();
      expect(isIndexable(slug), `${slug} is not listed`).toBe(true);
    }
  });
});
