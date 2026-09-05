export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60); if (h < 0) h += 360;
  }
  return [h, Math.round(s * 100), Math.round(v * 100)];
}

export function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

export function parseAnyColor(input: string): [number, number, number] | null {
  const s = input.trim();
  // HEX
  const hexMatch = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i.exec(s);
  if (hexMatch) {
    const h = hexMatch[1].length === 3
      ? hexMatch[1].split("").map((c) => c + c).join("")
      : hexMatch[1];
    return hexToRgb("#" + h);
  }
  // rgb()
  const rgbMatch = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(s);
  if (rgbMatch) return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  // hsl()
  const hslMatch = /^hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i.exec(s);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s2 = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    const q = l < 0.5 ? l * (1 + s2) : l + s2 - l * s2;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [Math.round(hue2rgb(h + 1 / 3) * 255), Math.round(hue2rgb(h) * 255), Math.round(hue2rgb(h - 1 / 3) * 255)];
  }
  // CSS named color via canvas.
  return resolveCssColor(s);
}

/**
 * The slice of CanvasRenderingContext2D that {@link readCssColor} touches, kept
 * narrow so a test can hand it a stand-in: this module's suite runs under
 * vitest's "node" environment, where no canvas exists.
 */
export type CanvasColorProbe = {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, width: number, height: number): void;
  getImageData(x: number, y: number, width: number, height: number): { data: ArrayLike<number> };
};

// Assigning an invalid value to fillStyle is a no-op per the HTML spec: the
// property keeps whatever it held before. A fresh context holds #000000, so
// without a seed of our own, junk input paints black and reads back as an
// opaque [0, 0, 0] instead of being rejected. Seeding a known value first makes
// an unchanged fillStyle the proof that the browser refused the assignment.
//
// Two seeds, because a single one would misjudge an input equal to it. A valid
// colour can serialize to at most one, so only a rejected input survives both.
const PROBE_SEEDS = ["#010203", "#040506"] as const;

export function readCssColor(
  probe: CanvasColorProbe,
  input: string,
): [number, number, number] | null {
  const accepted = PROBE_SEEDS.some((seed) => {
    probe.fillStyle = seed;
    probe.fillStyle = input;
    return probe.fillStyle !== seed;
  });
  if (!accepted) return null;

  probe.fillRect(0, 0, 1, 1);
  const pixel = probe.getImageData(0, 0, 1, 1).data;
  if (pixel[3] === 0) return null;
  return [pixel[0], pixel[1], pixel[2]];
}

function resolveCssColor(input: string): [number, number, number] | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return readCssColor(ctx, input);
  } catch {
    return null;
  }
}
