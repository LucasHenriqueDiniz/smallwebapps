import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response(
    ["User-agent: *", "Allow: /", "Sitemap: https://smallwebapps.com/sitemap-index.xml"].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  );
};
