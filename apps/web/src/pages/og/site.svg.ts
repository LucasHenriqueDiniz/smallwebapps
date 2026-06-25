import type { APIRoute } from "astro";
import { siteConfig } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const GET: APIRoute = () => {
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#eff6ff" />
      <stop offset="52%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#fff7ed" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a73e8" />
      <stop offset="100%" stop-color="#f97316" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1040" cy="110" r="180" fill="#f97316" opacity="0.12" />
  <circle cx="120" cy="520" r="210" fill="#1a73e8" opacity="0.12" />
  <rect x="72" y="72" width="1056" height="486" rx="44" fill="rgba(255,255,255,0.78)" stroke="rgba(15,23,42,0.08)" />
  <rect x="112" y="112" width="96" height="96" rx="28" fill="url(#accent)" />
  <text x="160" y="174" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif" font-size="38" font-weight="800" fill="#ffffff">SW</text>
  <text x="236" y="148" font-family="Inter, Segoe UI, sans-serif" font-size="34" font-weight="800" fill="#0f172a">${escapeXml(siteConfig.name)}</text>
  <text x="236" y="188" font-family="Inter, Segoe UI, sans-serif" font-size="22" font-weight="600" fill="#475569">Fast browser-based tools. No accounts. No server uploads.</text>
  <text x="112" y="322" font-family="Inter, Segoe UI, sans-serif" font-size="68" font-weight="850" fill="#0f172a">Free tools for everyday web work</text>
  <text x="112" y="396" font-family="Inter, Segoe UI, sans-serif" font-size="32" font-weight="600" fill="#334155">PDF, image, developer, data, and AI inspection utilities.</text>
  <rect x="112" y="456" width="232" height="56" rx="28" fill="#1a73e8" />
  <text x="228" y="492" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif" font-size="22" font-weight="750" fill="#ffffff">smallwebapps.com</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
