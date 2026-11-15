import { describe, expect, test } from "vitest";
import { appMap } from "./apps";
import { listedGuides } from "./guides";
import { featuredSlugs, heroGuideSlug, heroQuickSlugs, popularSlugs } from "./home";
import { isIndexable } from "./indexing";
import { TOOL_NAV_ORDER, listedApps, listedCategories, listedInCategory, navGuideSlugs, navGuides } from "./listed";

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

describe("navigation order", () => {
  test("places every listed tool, and names no unlisted one", () => {
    expect([...TOOL_NAV_ORDER].sort()).toEqual(listedApps.map((app) => app.slug).sort());
  });

  test("puts TubeTrace first in its category", () => {
    expect(listedInCategory("YouTube / Data")[0]?.slug).toBe("tubetrace");
  });

  test("footer guides are exactly the listed guides, the recap guide first", () => {
    expect([...navGuideSlugs].sort()).toEqual(listedGuides.map((guide) => guide.slug).sort());
    expect(navGuides).toHaveLength(listedGuides.length);
    expect(navGuides[0].slug).toBe("youtube-recap-past-years");
  });

  test("the hero guide is a listed guide", () => {
    expect(listedGuides.map((guide) => guide.slug)).toContain(heroGuideSlug);
  });
});
