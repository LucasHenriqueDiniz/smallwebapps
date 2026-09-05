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
 * These pages are NOT deleted. They stay live, linked from /apps, and reachable
 * through search — `noindex, follow` keeps the links crawlable while removing
 * the page from the index. Reversing any decision means deleting one line here.
 */

/**
 * Rule 1 — size and format variants.
 *
 * Several URLs for one underlying tool, differing only by a number in the
 * slug. This is the shape Google's guidance calls a doorway page, and it is the
 * least defensible thing on the site.
 */
const SIZE_VARIANTS = [
  "compress-pdf-to-100kb",
  "compress-pdf-to-200kb",
  "compress-pdf-to-500kb",
  "compress-pdf-to-1mb",
  "compress-image-to-50kb",
  "compress-image-to-100kb",
  "compress-image-to-200kb",
  "compress-jpg-to-100kb",
  "compress-png-to-100kb",
  "compress-webp-to-100kb",
];

/**
 * Rule 2 — commodity utilities.
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

/** Slugs served with `noindex, follow` and kept out of the sitemap. */
export const noindexSlugs = new Set<string>([...SIZE_VARIANTS, ...COMMODITY]);

export function isIndexable(slug: string): boolean {
  return !noindexSlugs.has(slug);
}

/**
 * True for a built page URL path, e.g. "/apps/json-formatter/".
 * Used by the sitemap filter, which only sees URLs.
 */
export function isIndexableUrl(url: string): boolean {
  const match = url.match(/\/apps\/([a-z0-9-]+)\/?$/);
  return match ? isIndexable(match[1]) : true;
}
