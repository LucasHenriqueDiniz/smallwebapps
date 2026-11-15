import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { appMap } from "./apps";
import { guides } from "./guides";
import { isIndexable } from "./indexing";

/**
 * The /apps/ rules in public/_redirects, read the way Cloudflare Pages reads
 * them: source, destination, status. Comments and blank lines are skipped.
 */
const allRules = readFileSync(new URL("../../public/_redirects", import.meta.url), "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.startsWith("/"))
  .map((line) => {
    const [source, destination, status] = line.split(/\s+/);
    return { source, destination, status };
  });
const rules = allRules.filter((rule) => rule.source.startsWith("/apps/"));
const guideRules = allRules.filter((rule) => rule.source.startsWith("/guides/"));

const slugOf = (path: string) => path.match(/^\/apps\/([a-z0-9-]+)\/?$/)?.[1];

describe("/apps/ redirects", () => {
  test("cover the 12 retired variants and the 2 merged tools, both slash forms each", () => {
    expect(rules).toHaveLength(28);
  });

  test.each(rules)("$source never shadows a live tool page", ({ source }) => {
    // Cloudflare follows a redirect even when an asset exists at the path, so a
    // rule left behind for a slug that came back would hide the page.
    const slug = slugOf(source);
    expect(slug).toBeDefined();
    expect(appMap[slug!]).toBeUndefined();
  });

  // The variants of 2026-10-18 land on pdf-compress and image-optimize, which
  // left the index on 2026-11-15 and still do the job for a visitor. So the
  // rule for every source is a live tool; the merges of 2026-11-15 must also
  // land on an indexable one, since the page they replace was indexable.
  test.each(rules)("$source lands on a live tool with one 301", ({ destination, status }) => {
    expect(status).toBe("301");
    expect(destination).toMatch(/\/$/);
    expect(appMap[slugOf(destination)!]).toBeDefined();
  });

  test.each(["/apps/screenshot-to-text", "/apps/image-metadata"])("%s merges into an indexable tool", (source) => {
    const rule = rules.find((item) => item.source === source);
    expect(rule).toBeDefined();
    expect(isIndexable(slugOf(rule!.destination)!)).toBe(true);
  });

  test("every source is written with and without the trailing slash", () => {
    const sources = new Set(rules.map((rule) => rule.source));
    for (const source of sources) {
      const twin = source.endsWith("/") ? source.slice(0, -1) : `${source}/`;
      expect(sources.has(twin), `${source} has no ${twin}`).toBe(true);
    }
  });
});

describe("/guides/ redirects", () => {
  test("cover the merged how-to-analyze guide, both slash forms", () => {
    expect(guideRules.map((rule) => rule.source).sort()).toEqual([
      "/guides/how-to-analyze-youtube-watch-history",
      "/guides/how-to-analyze-youtube-watch-history/",
    ]);
  });

  test.each(guideRules)("$source no longer exists as a guide, and lands on an indexable tool with one 301", ({ source, destination, status }) => {
    const slug = source.match(/^\/guides\/([a-z0-9-]+)\/?$/)?.[1];
    expect(guides.some((guide) => guide.slug === slug)).toBe(false);
    expect(status).toBe("301");
    const tool = slugOf(destination);
    expect(appMap[tool!]).toBeDefined();
    expect(isIndexable(tool!)).toBe(true);
  });
});
