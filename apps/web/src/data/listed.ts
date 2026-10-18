import { apps } from "./apps";
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

export function listedInCategory(category: string) {
  return listedApps.filter((app) => app.category === category);
}
