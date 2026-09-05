import type { APIRoute } from "astro";
import { defaultCategoryColor } from "@/data/categoryColors";
import { ogImageResponse, renderOgImage } from "@/lib/og-image";

export const GET: APIRoute = async () => {
  const png = await renderOgImage({
    title: "Free tools for everyday web work",
    footnote: "PDF · Image · Developer · Data · No accounts, no server uploads",
    accent: defaultCategoryColor,
  });
  return ogImageResponse(png);
};
