import type { APIRoute } from "astro";
import { apps } from "@/data/apps";
import { siteConfig } from "@/lib/site";

export const GET: APIRoute = () => {
  const services = apps.map((app) => ({
    name: app.name,
    url: new URL(app.landingUrl, siteConfig.siteUrl).toString(),
    category: app.category,
    status: app.status,
    implemented: app.implemented,
    description: app.shortDescription,
  }));

  return new Response(
    JSON.stringify(
      {
        name: siteConfig.name,
        url: `${siteConfig.siteUrl}/`,
        description:
          "A catalog of lightweight browser-based tools. Supported tool inputs are processed locally unless a page explicitly states otherwise.",
        documentation: new URL("/apps/", siteConfig.siteUrl).toString(),
        sitemap: new URL("/sitemap-index.xml", siteConfig.siteUrl).toString(),
        privacy: new URL("/privacy/", siteConfig.siteUrl).toString(),
        contact: new URL("/contact/", siteConfig.siteUrl).toString(),
        serviceCount: services.length,
        services,
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
};
