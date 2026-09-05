import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { isIndexableUrl } from "./src/data/indexing.ts";
import { guides } from "./src/data/guides.ts";

/** Last real edit date per guide slug. Every other page has no honest one. */
const guideLastmod = new Map(guides.map((guide) => [guide.slug, guide.modifiedDate]));

/**
 * Priority and changefreq per section, keyed by the first path segment.
 *
 * `never` is reserved by the sitemaps.org spec for archived URLs, so a live
 * tool page does not get it — that would be a claim the site cannot support.
 */
function sitemapHints(pathname) {
  if (pathname === "/") return { priority: 1.0, changefreq: "weekly" };

  const segments = pathname.split("/").filter(Boolean);
  const [section, slug] = segments;

  if (section === "apps") {
    return slug
      ? { priority: 0.7, changefreq: "monthly" }
      : { priority: 0.9, changefreq: "weekly" };
  }
  if (section === "guides") return { priority: 0.8, changefreq: "monthly" };
  if (section === "contact" || section === "privacy" || section === "terms") {
    return { priority: 0.9, changefreq: "yearly" };
  }
  return { priority: 0.6, changefreq: "yearly" };
}

export default defineConfig({
  site: "https://smallwebapps.com",
  // Cloudflare Pages serves a `directory` build at the trailing-slash URL:
  // /about/index.html answers /about/ with 200 and 301s /about onto it. Pinning
  // both settings is what keeps the sitemap, every canonical tag and every
  // internal href on the one URL shape that is not a redirect.
  trailingSlash: "always",
  build: { format: "directory" },
  // Respect an assigned dev port (e.g. from preview tooling); default stays 4321
  server: { port: process.env.PORT ? Number(process.env.PORT) : 4321 },
  integrations: [
    react(),
    tailwind(),
    sitemap({
      entryLimit: 45000,
      filter: (page) => {
        // Exclude admin and preview URLs
        if (page.includes('/admin') || page.includes('/preview')) {
          return false;
        }
        // A noindexed page must not be advertised in the sitemap.
        return isIndexableUrl(page);
      },
      // `item.url` is absolute, so splitting it on "/" yields "https:" as the
      // first segment and never a section name. Parse the pathname instead.
      //
      // No global `lastmod` either: stamping every URL with the build date is a
      // freshness signal the site has not earned. Guides carry a real edit date;
      // nothing else does, so nothing else claims one.
      serialize: (item) => {
        const { pathname } = new URL(item.url);
        const { priority, changefreq } = sitemapHints(pathname);
        const guideSlug = pathname.match(/^\/guides\/([a-z0-9-]+)\/?$/)?.[1];
        return {
          ...item,
          priority,
          changefreq,
          lastmod: guideSlug ? guideLastmod.get(guideSlug) : undefined,
        };
      }
    })
  ],
  output: "static"
});
