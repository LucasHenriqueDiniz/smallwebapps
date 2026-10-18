/**
 * The tools the home page names, by slug, in the order it shows them.
 *
 * Hand-ordered, and only from the listed set in `listed.ts`. `home.test.ts`
 * fails when a slug here is not listed. Before that test existed, the JSON
 * Formatter stayed the first featured card and the first hero link for weeks
 * after it was taken out of the index.
 */
export const heroQuickSlugs = ["tubetrace", "pdf-compress", "ai-image-checker"];

export const featuredSlugs = ["tubetrace", "pdf-compress", "image-resize", "ai-image-checker"];

export const popularSlugs = [
  "tubetrace",
  "pdf-compress",
  "pdf-merge",
  "image-resize",
  "image-to-pdf",
  "ai-image-checker",
  "image-optimize",
  "pdf-split",
  "image-to-text",
  "pdf-to-image",
  "youtube-tag-extractor",
  "exif-viewer",
];
