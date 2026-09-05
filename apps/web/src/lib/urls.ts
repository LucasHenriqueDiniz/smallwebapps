import { siteConfig } from "./site";

/**
 * One place decides the trailing slash, because the site has exactly one
 * canonical URL shape and three things have to agree on it: the sitemap, the
 * `<link rel="canonical">` of every page, and every internal `href`.
 *
 * The shape is forced by the host. Astro builds in `directory` format, so a
 * page ships as `/about/index.html`, and Cloudflare Pages answers `/about/`
 * with 200 while 301-ing `/about` onto it. The trailing-slash form is
 * therefore the only form that is not a redirect, and `astro.config.mjs`
 * pins `trailingSlash: "always"` so the sitemap emits the same.
 */
export function canonicalPath(path: string): string {
  const [pathname, query] = path.split("?");
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return query ? `${withSlash}?${query}` : withSlash;
}

/** Absolute canonical URL for an internal path. */
export function canonicalUrl(path: string): string {
  return new URL(canonicalPath(path), siteConfig.siteUrl).toString();
}

/** Canonical internal link to a category listing on /apps/. */
export function categoryPath(category: string): string {
  return `/apps/?cat=${encodeURIComponent(category).replaceAll("%20", "+")}`;
}
