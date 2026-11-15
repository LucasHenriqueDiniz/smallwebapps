/**
 * Which tool pages Google is asked to index.
 *
 * AdSense rejected the site for "Conteúdo de baixo valor" (low value content),
 * and Search Console agrees with the verdict: over three months the site drew
 * 1 click and 123 impressions at average position 24.8, and every one of the
 * four queries that drew an impression was YouTube/Takeout related. None of the
 * commodity utilities drew a single attributed impression.
 *
 * Google judges the site, not individual URLs. With 142 interchangeable utility
 * pages against ~12 substantial ones, the commodity pages define what the site
 * looks like. Narrowing the indexed set to pages that can plausibly earn a
 * ranking is the point of this file.
 *
 * These pages are NOT deleted. They stay live at their URLs with `noindex,
 * follow`. Since 2026-10-18 nothing links to them either: `listed.ts` makes
 * navigation link only indexable tools, so this list decides both at once.
 * Reversing any decision means deleting one line here.
 */

import { isGuideIndexable } from "./guides";

/**
 * The size and format variants (`compress-pdf-to-100kb`, `jpg-to-text`, …) that
 * used to be listed here are gone. They were doorway pages wrapping
 * `pdf-compress`, `image-optimize` and `image-to-text`, and the PDF four
 * promised a target size the code never aimed at. Each URL now answers 301 to
 * the tool it wrapped — see `public/_redirects` and the 2026-10-18 decision in
 * `docs/architecture/ARCHITECTURE.md`.
 */

/**
 * Commodity utilities.
 *
 * Tools whose entire behaviour is a short, well-known transformation available
 * identically on hundreds of sites. They are genuinely useful and stay live;
 * they simply cannot win a ranking and should not be what represents the site
 * to a reviewer.
 */
const COMMODITY = [
  // text and string
  "text-reverse", "case-converter", "slug-generator", "lorem-ipsum", "find-replace",
  "line-sorter", "duplicate-remover", "word-counter", "word-frequency-counter",
  "reading-time", "keyword-density-checker", "html-entities", "morse-encoder",
  "binary-text-converter", "url-encoder", "base64-encoder", "diff-viewer", "hex-dump",
  // identifiers, hashes, secrets
  "uuid-generator", "uuid-validator", "ulid-generator", "random-string",
  "hash-generator", "file-hash", "password-generator", "password-strength",
  "luhn-validator", "jwt-decoder",
  // numbers, units, dates
  "number-base-converter", "number-formatter", "percentage-calculator", "age-calculator",
  "date-diff", "data-size-converter", "css-unit-converter", "unit-converter",
  "statistics-calculator", "timestamp-converter", "timezone-converter",
  "loan-calculator", "bmi-calculator", "aspect-ratio-calculator", "chmod-calculator",
  // format conversion
  "json-formatter", "json-flatten", "json-to-xml", "json-to-csv", "json-path-extractor",
  "json-schema-generator", "csv-to-json", "csv-to-markdown", "csv-to-sql",
  "csv-delimiter-converter", "csv-column-extractor", "csv-cleaner", "xml-formatter",
  "xml-to-json", "yaml-to-json", "sql-formatter", "html-formatter", "html-minifier",
  "css-formatter", "css-minifier", "markdown-preview", "markdown-table-generator",
  // web dev helpers
  "regex-tester", "cron-parser", "user-agent-parser", "url-parser", "url-query-builder",
  "utm-builder", "mime-type-lookup", "http-status-codes", "email-validator",
  "dummy-data-generator", "contrast-checker", "css-border-radius", "css-clamp-generator",
  "css-gradient-generator", "css-shadow-generator", "color-converter", "color-shades",
  // config file generators
  "gitignore-generator", "dockerignore-generator", "htaccess-redirect-generator",
  "csp-generator", "robots-txt-generator", "sitemap-generator", "meta-tag-generator",
  "og-tag-generator", "open-graph-checker", "meta-tags-analyzer",
  // codes, colour pickers, social
  "qr-code-generator", "qr-code-reader", "barcode-generator", "favicon-generator",
  "color-palette-extractor", "image-color-picker", "screen-color-picker", "svg-to-png",
  "instagram-caption-formatter", "instagram-hashtag-extractor",
];

/**
 * The index narrowed to one cluster, 2026-11-15.
 *
 * These were the indexable PDF, image and YouTube-creator tools. Between
 * 2026-10-18 and 2026-11-15 the index grew from 14 to 33 of 47 sitemap URLs
 * while 28-day impressions fell from 96 to 25. Google turned the PDF pages down
 * on its own: 8 of 10 out of the index, 5 of them back from "Discovered" to
 * "unknown" after indexing was requested. Their head terms are six-figure,
 * "Hard" and answered by brand navigation. The site indexes the YouTube Takeout
 * cluster plus four privacy tools (image-to-text, pdf-ocr, searchable-pdf,
 * exif-viewer). Same mechanism as COMMODITY: served, `noindex, follow`,
 * unlinked. Evidence: docs/research/2026-11-15-organic-traffic/; decision of
 * 2026-11-15 in docs/architecture/ARCHITECTURE.md.
 */
const NARROWED = [
  // YouTube creator tools: no opening on the result pages, no measured demand
  "youtube-tag-extractor", "youtube-chapter-generator", "youtube-title-counter",
  "youtube-description-cleaner", "youtube-url-parser",
  // PDF: head terms owned by iLovePDF, Smallpdf and 11zon
  "pdf-compress", "pdf-merge", "pdf-split", "pdf-rotate", "pdf-to-image",
  "pdf-watermark", "pdf-metadata", "pdf-extract-text",
  // image editing, and a heuristic AI checker next to Google's own SynthID
  "ai-image-checker", "image-resize", "image-crop", "image-optimize",
  "image-flip-rotate", "image-grayscale", "image-to-pdf", "image-format-converter",
];

/** Slugs served with `noindex, follow` and kept out of the sitemap. */
export const noindexSlugs = new Set<string>([...COMMODITY, ...NARROWED]);

export function isIndexable(slug: string): boolean {
  return !noindexSlugs.has(slug);
}

/**
 * True for a built page URL path, e.g. "/apps/json-formatter/" or
 * "/guides/csv-cleaning-before-import/". Used by the sitemap filter and the ad
 * gate, which only see URLs.
 */
export function isIndexableUrl(url: string): boolean {
  const tool = url.match(/\/apps\/([a-z0-9-]+)\/?$/);
  if (tool) return isIndexable(tool[1]);
  const guide = url.match(/\/guides\/([a-z0-9-]+)\/?$/);
  if (guide) return isGuideIndexable(guide[1]);
  return true;
}
