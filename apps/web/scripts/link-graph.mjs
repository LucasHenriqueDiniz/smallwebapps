#!/usr/bin/env node
/**
 * The internal link graph between sitemap pages: for each one, how many other
 * sitemap pages link to it, and how many clicks it sits from "/".
 *
 *   node scripts/link-graph.mjs                           # the build in ./dist
 *   node scripts/link-graph.mjs https://smallwebapps.com  # production
 *
 * Like scan-links.mjs it reads the pages themselves, so it measures what a
 * crawler walks, and the same command works on dist and on production. Exit
 * status is 1 when a rule fails. The rules come from
 * docs/plans/organic-traffic/slice-05-links-to-the-cluster.md:
 *
 *   - no orphan: every sitemap page has an inbound link and is reachable from "/";
 *   - /apps/tubetrace/, the page with the site's search impressions, is linked
 *     from every other sitemap page;
 *   - every YouTube guide (a /guides/ slug containing "youtube") has at least 10
 *     inbound links and sits at most one click from "/".
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const target = process.argv[2];

const TUBETRACE = "/apps/tubetrace/";
const GUIDE_MIN_INBOUND = 10;
const GUIDE_MAX_DEPTH = 1;

async function load(path) {
  if (target) {
    const response = await fetch(new URL(path, target), { redirect: "manual" });
    return response.status === 200 ? await response.text() : "";
  }
  const file = path.endsWith("/") ? join(DIST, path, "index.html") : join(DIST, path);
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

/** Same-site page links, normalised to "/path/": no query, no fragment, no assets. */
const linksIn = (html) =>
  [...html.matchAll(/href=["'](?:https:\/\/smallwebapps\.com)?(\/(?!\/)[^"'#?]*)/g)]
    .map((m) => m[1])
    .filter((path) => !/\.[a-z0-9]+$/i.test(path.split("/").pop() ?? ""))
    .map((path) => (path.endsWith("/") ? path : `${path}/`));

const sitemap = await load("/sitemap-0.xml");
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (pages.length === 0) {
  console.error("no URLs in /sitemap-0.xml: nothing was measured, which is not a pass");
  process.exit(1);
}
const inSitemap = new Set(pages);

const outbound = new Map();
for (const page of pages) {
  const targets = new Set(linksIn(await load(page)).filter((link) => inSitemap.has(link) && link !== page));
  outbound.set(page, targets);
}

const inbound = new Map(pages.map((page) => [page, 0]));
for (const targets of outbound.values()) for (const link of targets) inbound.set(link, inbound.get(link) + 1);

const depth = new Map([["/", 0]]);
const queue = ["/"];
while (queue.length > 0) {
  const page = queue.shift();
  for (const link of outbound.get(page) ?? []) {
    if (!depth.has(link)) {
      depth.set(link, depth.get(page) + 1);
      queue.push(link);
    }
  }
}

const rows = pages
  .map((page) => ({ page, inbound: inbound.get(page), depth: depth.get(page) ?? "-" }))
  .sort((a, b) => a.inbound - b.inbound || a.page.localeCompare(b.page));
console.log("inbound  depth  page");
for (const row of rows) console.log(`${String(row.inbound).padStart(7)}  ${String(row.depth).padStart(5)}  ${row.page}`);

const others = pages.length - 1;
const orphans = pages.filter((page) => page !== "/" && (inbound.get(page) === 0 || !depth.has(page)));
const youtubeGuides = pages.filter((page) => /^\/guides\/[a-z0-9-]*youtube[a-z0-9-]*\/$/.test(page));
const weakGuides = youtubeGuides.filter(
  (page) => inbound.get(page) < GUIDE_MIN_INBOUND || !depth.has(page) || depth.get(page) > GUIDE_MAX_DEPTH,
);
const tubetraceIn = inSitemap.has(TUBETRACE) ? inbound.get(TUBETRACE) : 0;

const checks = [
  [`no orphan, all reachable from /`, orphans.length === 0, `${orphans.length} orphan(s)${orphans.length ? `: ${orphans.join(", ")}` : ""}`],
  [`${TUBETRACE} linked from every other page`, tubetraceIn === others, `${tubetraceIn}/${others}`],
  [
    `YouTube guides: >= ${GUIDE_MIN_INBOUND} inbound, depth <= ${GUIDE_MAX_DEPTH}`,
    youtubeGuides.length > 0 && weakGuides.length === 0,
    `${youtubeGuides.length - weakGuides.length}/${youtubeGuides.length}${weakGuides.length ? `; short: ${weakGuides.map((page) => `${page} (${inbound.get(page)}, depth ${depth.get(page) ?? "-"})`).join(", ")}` : ""}`,
  ],
];
console.log(`\nlink-graph ${target ?? "dist"}: ${pages.length} sitemap pages`);
for (const [name, ok, detail] of checks) console.log(`  ${ok ? "pass" : "FAIL"}  ${name}: ${detail}`);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
