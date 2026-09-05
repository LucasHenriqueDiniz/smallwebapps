import type { APIRoute } from "astro";
import { apps } from "@/data/apps";
import { getCategoryColor } from "@/data/categoryColors";
import { ogImageResponse, renderOgImage } from "@/lib/og-image";

export function getStaticPaths() {
  return apps.map((app) => ({ params: { slug: app.slug }, props: { app } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { app } = props as { app: (typeof apps)[number] };
  const png = await renderOgImage({
    title: app.name,
    footnote: `${app.category} · Free · Browser-based · No upload`,
    accent: getCategoryColor(app.category),
  });
  return ogImageResponse(png);
};
