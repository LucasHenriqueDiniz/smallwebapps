import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { appMap } from "./apps";
import { isIndexable } from "./indexing";

/**
 * The /apps/ rules in public/_redirects, read the way Cloudflare Pages reads
 * them: source, destination, status. Comments and blank lines are skipped.
 */
const rules = readFileSync(new URL("../../public/_redirects", import.meta.url), "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.startsWith("/apps/"))
  .map((line) => {
    const [source, destination, status] = line.split(/\s+/);
    return { source, destination, status };
  });

const slugOf = (path: string) => path.match(/^\/apps\/([a-z0-9-]+)\/?$/)?.[1];

describe("/apps/ redirects", () => {
  test("cover the 12 retired size and format variants, both slash forms each", () => {
    expect(rules).toHaveLength(24);
  });

  test.each(rules)("$source never shadows a live tool page", ({ source }) => {
    // Cloudflare follows a redirect even when an asset exists at the path, so a
    // rule left behind for a slug that came back would hide the page.
    const slug = slugOf(source);
    expect(slug).toBeDefined();
    expect(appMap[slug!]).toBeUndefined();
  });

  test.each(rules)("$source lands on an indexable tool with one 301", ({ destination, status }) => {
    expect(status).toBe("301");
    expect(destination).toMatch(/\/$/);
    const slug = slugOf(destination);
    expect(appMap[slug!]).toBeDefined();
    expect(isIndexable(slug!)).toBe(true);
  });

  test("every source is written with and without the trailing slash", () => {
    const sources = new Set(rules.map((rule) => rule.source));
    for (const source of sources) {
      const twin = source.endsWith("/") ? source.slice(0, -1) : `${source}/`;
      expect(sources.has(twin), `${source} has no ${twin}`).toBe(true);
    }
  });
});
