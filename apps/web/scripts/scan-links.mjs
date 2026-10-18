#!/usr/bin/env node
/**
 * Scan every page in the sitemap for links to tool pages that are not listed.
 *
 *   node scripts/scan-links.mjs                         # the build in ./dist
 *   node scripts/scan-links.mjs https://smallwebapps.com  # production
 *
 * "Not listed" is read from the pages themselves rather than from
 * src/data/indexing.ts: a tool page served with `noindex` is unlisted, and a
 * link that lands on a 404 or a redirect is broken. So this measures what a
 * crawler — or an AdSense reviewer — would actually walk into, and works the
 * same against dist and against production.
 *
 * Exit status is 1 when any check fails, so it can gate a slice.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const target = process.argv[2];

/** Returns { status, html } for a path like "/apps/pdf-merge/". */
async function load(path) {
  if (target) {
    const response = await fetch(new URL(path, target), { redirect: "manual" });
    return { status: response.status, html: response.status === 200 ? await response.text() : "" };
  }
  const file = path.endsWith("/") ? join(DIST, path, "index.html") : join(DIST, path);
  try {
    return { status: 200, html: await readFile(file, "utf8") };
  } catch {
    return { status: 404, html: "" };
  }
}

const isNoindex = (html) =>
  /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);

const toolLinks = (html) =>
  [...html.matchAll(/href=["'](?:https:\/\/smallwebapps\.com)?\/apps\/([a-z0-9-]+)\/?["']/g)].map((m) => m[1]);

const sitemapIndex = (await load("/sitemap-0.xml")).html;
const pages = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (pages.length === 0) {
  console.error("no URLs found in /sitemap-0.xml — nothing was scanned, which is not a pass");
  process.exit(1);
}

// On each indexable tool page: exactly one <main>, and no sentence announcing a
// feature that does not exist yet.
const UNBUILT = /\b(planned|future update|not yet|no option yet)\b/i;
const visibleText = (html) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");

const linksByPage = new Map();
const toolPageProblems = [];
let toolPages = 0;
for (const path of pages) {
  const { status, html } = await load(path);
  if (status !== 200) {
    console.error(`sitemap URL ${path} answered ${status}`);
    process.exitCode = 1;
    continue;
  }
  linksByPage.set(path, toolLinks(html));
  if (!/^\/apps\/[a-z0-9-]+\/$/.test(path)) continue;
  toolPages += 1;
  const mains = (html.replace(/<!--[\s\S]*?-->/g, " ").match(/<main[\s>]/g) ?? []).length;
  if (mains !== 1) toolPageProblems.push(`${path} has ${mains} <main>`);
  const unbuilt = visibleText(html).match(UNBUILT);
  if (unbuilt) toolPageProblems.push(`${path} says "${unbuilt[0]}"`);
  // A listed tool always has listed neighbours in its own category, so its
  // related block is "More tools in …". The other heading is for unlisted
  // tools only; seeing it here means the heading rule regressed.
  if (!/More tools in /.test(html)) toolPageProblems.push(`${path} has no "More tools in" block`);
}

const linkedSlugs = new Set([...linksByPage.values()].flat());
const unlisted = new Map();
for (const slug of linkedSlugs) {
  const { status, html } = await load(`/apps/${slug}/`);
  if (status !== 200) unlisted.set(slug, `answers ${status}`);
  else if (isNoindex(html)) unlisted.set(slug, "noindex");
}

let offending = 0;
for (const [page, slugs] of linksByPage) {
  const bad = [...new Set(slugs.filter((slug) => unlisted.has(slug)))];
  if (bad.length === 0) continue;
  offending += bad.length;
  console.log(`  ${page} → ${bad.map((slug) => `${slug} (${unlisted.get(slug)})`).join(", ")}`);
}

// The home page's own copy must not sell what navigation no longer links.
// Title, H1, hero subline and section headings only: guide titles linked from
// the page are not the page's claim about itself.
const STALE_COPY = /developer|json|csv|most popular|usually pay/i;
const home = (await load("/")).html;
const homeCopy = [
  ...home.matchAll(/<title>([\s\S]*?)<\/title>|<h[12][^>]*>([\s\S]*?)<\/h[12]>|<p class="hero-sub"[^>]*>([\s\S]*?)<\/p>/g),
]
  .map((m) => (m[1] ?? m[2] ?? m[3]).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
  .filter((text) => STALE_COPY.test(text));
for (const text of homeCopy) console.log(`  / copy → "${text}"`);
if (homeCopy.length > 0) process.exitCode = 1;

for (const problem of toolPageProblems) console.log(`  ${problem}`);
if (toolPageProblems.length > 0) process.exitCode = 1;

const source = target ?? "dist";
console.log(
  `scan:links ${source}: ${linksByPage.size} sitemap pages, ${linkedSlugs.size} distinct tools linked, ` +
    `${offending} link(s) to unlisted or missing tools, ${homeCopy.length} stale home-page heading(s), ` +
    `${toolPages} tool pages with ${toolPageProblems.length} <main>, "planned" or related-heading problem(s)`,
);
if (offending > 0) process.exitCode = 1;
