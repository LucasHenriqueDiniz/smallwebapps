import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://smallwebapps.com",
  integrations: [
    react(),
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 45000,
      filter: (page) => {
        // Exclude admin and preview URLs
        if (page.includes('/admin') || page.includes('/preview')) {
          return false;
        }
        return true;
      },
      serialize: (item) => {
        // Custom priority based on URL patterns
        if (item.url.includes('/')) {
          const segments = item.url.split('/').filter(Boolean);

          if (item.url === 'https://smallwebapps.com/') {
            item.priority = 1.0;
            item.changefreq = 'weekly';
          } else if (segments[0] === 'apps' && segments.length === 2) {
            // Tool pages
            item.priority = 0.7;
            item.changefreq = 'never';
          } else if (segments[0] === 'apps' && !segments[1]) {
            // /apps directory
            item.priority = 0.9;
            item.changefreq = 'weekly';
          } else if (segments[0] === 'guides') {
            // Guide pages
            item.priority = 0.8;
            item.changefreq = 'monthly';
          } else if (segments[0] === 'contact' || segments[0] === 'privacy' || segments[0] === 'terms') {
            // Trust pages
            item.priority = 0.9;
            item.changefreq = 'yearly';
          }
        }
        return item;
      }
    })
  ],
  output: "static"
});

