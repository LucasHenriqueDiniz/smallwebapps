import { apps } from "./apps";
import { listedGuides, type GuideDefinition } from "./guides";
import { isIndexable } from "./indexing";

/**
 * The tools navigation is allowed to link: exactly the indexable ones.
 *
 * The 114 commodity utilities in `indexing.ts` used to be noindexed and still
 * linked from the header, the home page, /apps and the related-tool blocks.
 * AdSense reviews "all pages of your site", not only what Search indexes, so a
 * reviewer kept walking through the tools the site itself judged not worth
 * indexing. They stay built and served at their URLs; nothing links to them.
 * Decided 2026-10-18 — see `docs/architecture/ARCHITECTURE.md`.
 *
 * Every surface that links or counts tools reads from here, so moving a slug
 * out of `COMMODITY` re-indexes and re-links it in one edit.
 */
export const listedApps = apps.filter((app) => isIndexable(app.slug));

const CATEGORY_ORDER = [
  "PDF Tools",
  "Image / Inspection",
  "Developer Tools",
  "Data Tools",
  "YouTube / Data",
];

/**
 * Categories in display order, dropping any with no listed tool. Developer
 * Tools and Data Tools fall out this way: none of their tools is indexable.
 */
export const listedCategories = CATEGORY_ORDER.filter((category) =>
  listedApps.some((app) => app.category === category),
);

/**
 * The order navigation shows tools in, by slug. Since 2026-11-15 search work
 * goes to the YouTube Takeout cluster, so TubeTrace leads wherever a list has
 * room for one tool. A listed tool missing here goes last, in catalog order;
 * `listed.test.ts` fails until it is placed.
 */
export const TOOL_NAV_ORDER = ["tubetrace", "image-to-text", "pdf-ocr", "searchable-pdf", "exif-viewer"];

const navRank = (slug: string) => {
  const rank = TOOL_NAV_ORDER.indexOf(slug);
  return rank < 0 ? TOOL_NAV_ORDER.length : rank;
};

export function listedInCategory(category: string) {
  return listedApps
    .filter((app) => app.category === category)
    .sort((a, b) => navRank(a.slug) - navRank(b.slug));
}

/**
 * The guides the footer links from every page, in order, with a short label.
 * Every listed guide is here, the YouTube cluster first and the recap guide
 * ahead of it; `listed.test.ts` fails when a listed guide is missing or an
 * unlisted one is named. That puts each guide one click from "/" and gives it
 * an inbound link from every page (slice 5 of docs/plans/organic-traffic/).
 */
const GUIDE_NAV: [slug: string, label: string][] = [
  ["youtube-recap-past-years", "YouTube Recap for past years"],
  ["how-to-export-youtube-watch-history", "Export your watch history"],
  ["youtube-watch-history-json-format", "watch-history.json, field by field"],
  ["youtube-takeout-json-vs-html", "Takeout JSON or HTML"],
  ["why-youtube-watch-counts-differ", "Why watch counts differ"],
  ["what-your-youtube-history-reveals", "What your history reveals"],
  ["pause-delete-youtube-history", "Pausing and deleting history"],
  ["privacy-first-file-tools-local-processing", "How local processing works"],
];

export const navGuides: (GuideDefinition & { navLabel: string })[] = GUIDE_NAV.flatMap(([slug, navLabel]) => {
  const guide = listedGuides.find((item) => item.slug === slug);
  return guide ? [{ ...guide, navLabel }] : [];
});

export const navGuideSlugs = GUIDE_NAV.map(([slug]) => slug);
