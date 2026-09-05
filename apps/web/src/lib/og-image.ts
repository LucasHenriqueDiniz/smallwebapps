import fs from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import sharp from "sharp";

/**
 * Social preview cards, rendered to real PNG pixels at build time.
 *
 * They used to be SVG. No consumer of an og:image renders SVG — not Google
 * Search or Discover, not Open Graph, not Twitter/X — so every share of this
 * site went out with no image at all, while the head still declared
 * og:image:width 1200 for a file that had no pixels.
 *
 * satori lays the card out and writes every glyph as a <path>, so the SVG it
 * hands to sharp carries no <text> and needs no font installed on the build
 * machine. sharp then rasterises it. Both run at build time only; nothing here
 * reaches the browser.
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const require = createRequire(import.meta.url);

/**
 * The font ships as a pinned dependency (@fontsource/inter) and is read off
 * disk, never fetched over the network during a build. woff, not woff2 —
 * satori cannot parse woff2.
 */
function loadFont(weight: 600 | 800) {
  return {
    name: "Inter",
    data: fs.readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`)),
    weight,
    style: "normal" as const,
  };
}

let fontCache: ReturnType<typeof loadFont>[] | null = null;

function fonts() {
  fontCache ??= [loadFont(600), loadFont(800)];
  return fontCache;
}

/** Minimal React-element shape satori accepts, built without JSX. */
type Node = { type: string; props: { style?: Record<string, unknown>; children?: Node[] | string } };

const node = (style: Record<string, unknown>, children?: Node[] | string): Node => ({
  type: "div",
  props: children === undefined ? { style } : { style, children },
});

interface OgCard {
  /** Large headline, usually the tool or site name. */
  title: string;
  /** Small line along the bottom. */
  footnote: string;
  /** Accent the gradient starts from. */
  accent: string;
}

function card({ title, footnote, accent }: OgCard): Node {
  return node(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 80,
      backgroundImage: `linear-gradient(135deg, ${accent} 0%, #0f172a 100%)`,
      color: "#ffffff",
      fontFamily: "Inter",
    },
    [
      node({ display: "flex", flexDirection: "column" }, [
        node({ fontSize: 32, fontWeight: 600, letterSpacing: 2, color: "rgba(255,255,255,0.85)" }, "SMALL WEB APPS"),
        node({ marginTop: 22, width: 120, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.6)" }),
      ]),
      node({ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1 }, title),
      node({ display: "flex", fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.75)" }, footnote),
    ],
  );
}

/** Renders one 1200x630 PNG. */
export async function renderOgImage(spec: OgCard): Promise<Buffer> {
  const svg = await satori(card(spec) as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts: fonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

export function ogImageResponse(png: Buffer): Response {
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
