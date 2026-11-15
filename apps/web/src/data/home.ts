/**
 * The tools the home page names, by slug, in the order it shows them.
 *
 * Hand-ordered, and only from the listed set in `listed.ts`. `home.test.ts`
 * fails when a slug here is not listed. Before that test existed, the JSON
 * Formatter stayed the first featured card and the first hero link for weeks
 * after it was taken out of the index.
 */
export const heroQuickSlugs = ["tubetrace", "image-to-text", "pdf-ocr"];

export const featuredSlugs = ["tubetrace", "image-to-text", "pdf-ocr", "exif-viewer"];

export const popularSlugs = ["tubetrace", "image-to-text", "pdf-ocr", "searchable-pdf", "exif-viewer"];
