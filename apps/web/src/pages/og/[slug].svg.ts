import type { APIRoute } from "astro";
import { apps } from "@/data/apps";
import { getCategoryColor } from "@/data/categoryColors";

export function getStaticPaths() {
  return apps.map((app) => ({ params: { slug: app.slug }, props: { app } }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wraps a string into multiple lines of roughly maxChars characters, breaking on word boundaries. */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export const GET: APIRoute = ({ props }) => {
  const { app } = props as { app: (typeof apps)[number] };
  const color = getCategoryColor(app.category);
  const lines = wrapText(app.name, 22).slice(0, 3);
  const titleStartY = 630 / 2 - ((lines.length - 1) * 64) / 2;

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <text x="80" y="100" font-family="Inter, Segoe UI, sans-serif" font-size="32" font-weight="700" fill="rgba(255,255,255,0.85)" letter-spacing="2">SMALL WEB APPS</text>
  <rect x="80" y="140" width="120" height="6" rx="3" fill="rgba(255,255,255,0.6)" />
  ${lines
    .map(
      (line, i) =>
        `<text x="80" y="${titleStartY + i * 76}" font-family="Inter, Segoe UI, sans-serif" font-size="64" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <text x="80" y="560" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="600" fill="rgba(255,255,255,0.75)">${escapeXml(app.category)} · Free · Browser-based · No upload</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
