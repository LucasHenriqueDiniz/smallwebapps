import { describe, expect, it } from "vitest";
import {
  hexToRgb,
  parseAnyColor,
  readCssColor,
  rgbToCmyk,
  rgbToHsl,
  rgbToHsv,
} from "@/tools/color-converter/color";

describe("hexToRgb", () => {
  it("reads each channel of a six-digit hex", () => {
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    expect(hexToRgb("#3b82f6")).toEqual([59, 130, 246]);
  });

  it("accepts a six-digit hex without the leading hash", () => {
    expect(hexToRgb("3b82f6")).toEqual([59, 130, 246]);
  });

  it("trims surrounding whitespace before matching", () => {
    expect(hexToRgb("  #ffffff  ")).toEqual([255, 255, 255]);
  });

  it("rejects anything that is not six hex digits, the three-digit form included", () => {
    expect(hexToRgb("#fff")).toBeNull();
    expect(hexToRgb("#ff")).toBeNull();
    expect(hexToRgb("#ffff")).toBeNull();
    expect(hexToRgb("#fffffff")).toBeNull();
    expect(hexToRgb("#ggg")).toBeNull();
  });
});

describe("rgbToHsl", () => {
  it("maps pure red to hue 0 at full saturation and half lightness", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]);
  });

  it("orients the green sector by blue minus red, not the reverse", () => {
    // max === g with r !== b is the only case where that subtraction's order
    // shows: (b-r) puts this at 150 degrees, (r-b) would put it at 90.
    expect(rgbToHsl(0, 255, 128)).toEqual([150, 100, 50]);
  });

  it("reports no saturation for grey", () => {
    expect(rgbToHsl(128, 128, 128)).toEqual([0, 0, 50]);
  });

  it("wraps hue past the red boundary instead of returning a negative", () => {
    const [hue] = rgbToHsl(255, 0, 128);
    expect(hue).toBe(330);
  });

  it("separates the three hue sectors", () => {
    expect(rgbToHsl(0, 255, 0)).toEqual([120, 100, 50]);
    expect(rgbToHsl(0, 0, 255)).toEqual([240, 100, 50]);
  });
});

describe("rgbToHsv", () => {
  it("maps black to zero on every channel", () => {
    expect(rgbToHsv(0, 0, 0)).toEqual([0, 0, 0]);
  });

  it("maps pure red to hue 0 at full saturation and value", () => {
    expect(rgbToHsv(255, 0, 0)).toEqual([0, 100, 100]);
  });

  it("keeps value at the largest channel while saturation follows the spread", () => {
    expect(rgbToHsv(64, 128, 128)).toEqual([180, 50, 50]);
  });

  it("wraps a negative hue into the top of the circle rather than reporting it", () => {
    // Red largest with blue above green puts the raw hue at -30.1 degrees.
    expect(rgbToHsv(255, 0, 128)).toEqual([330, 100, 100]);
  });

  it("rounds the hue to a whole degree", () => {
    // Raw hue here is 23.53 degrees, so a missing round shows up immediately.
    expect(rgbToHsv(255, 100, 0)).toEqual([24, 100, 100]);
  });
});

describe("rgbToCmyk", () => {
  it("puts black entirely in the key channel", () => {
    expect(rgbToCmyk(0, 0, 0)).toEqual([0, 0, 0, 100]);
  });

  it("puts no ink at all on white", () => {
    expect(rgbToCmyk(255, 255, 255)).toEqual([0, 0, 0, 0]);
  });

  it("mixes cyan and magenta for blue, leaving yellow and key empty", () => {
    expect(rgbToCmyk(0, 0, 255)).toEqual([100, 100, 0, 0]);
  });
});

describe("parseAnyColor", () => {
  it("expands the three-digit hex form and reads the six-digit one", () => {
    // #abc, not #fff: a repdigit expands identically whether each character is
    // doubled or the whole string is repeated, so it proves nothing.
    expect(parseAnyColor("#abc")).toEqual([170, 187, 204]);
    expect(parseAnyColor("#fff")).toEqual([255, 255, 255]);
    expect(parseAnyColor("#ffffff")).toEqual([255, 255, 255]);
    expect(parseAnyColor("#3b82f6")).toEqual([59, 130, 246]);
    expect(parseAnyColor("3b82f6")).toEqual([59, 130, 246]);
  });

  it("reads the rgb() form the input box accepts", () => {
    expect(parseAnyColor("rgb(59, 130, 246)")).toEqual([59, 130, 246]);
  });

  it("reads the hsl() form the input box accepts", () => {
    expect(parseAnyColor("hsl(0, 100%, 50%)")).toEqual([255, 0, 0]);
    expect(parseAnyColor("hsl(120, 100%, 50%)")).toEqual([0, 255, 0]);
    // The % is optional in the regex, and nothing else covers that.
    expect(parseAnyColor("hsl(0, 100, 50)")).toEqual([255, 0, 0]);
  });

  // This pins the Node fallback only: under vitest's "node" environment
  // `document` is undefined, so parseAnyColor's last branch throws and the catch
  // returns null. A browser reaches the same answer by a different route, and
  // that route is covered by the readCssColor cases below rather than here.
  it("falls back to null when no canvas is available to resolve a named colour", () => {
    expect(parseAnyColor("not a color")).toBeNull();
    expect(parseAnyColor("")).toBeNull();
  });
});

describe("readCssColor", () => {
  // A stand-in for CanvasRenderingContext2D reproducing the one behaviour this
  // code turns on: assigning an unrecognised value to fillStyle is a no-op and
  // the property keeps whatever it held before. Without that, a fake would
  // accept junk and the test would pass against the bug it is here to catch.
  const namedColors: Record<string, [number, number, number, number]> = {
    blue: [0, 0, 255, 255],
    rebeccapurple: [102, 51, 153, 255],
    black: [0, 0, 0, 255],
    transparent: [0, 0, 0, 0],
  };

  function parseFillStyle(value: string): [number, number, number, number] | null {
    const key = value.trim().toLowerCase();
    if (key in namedColors) return namedColors[key];
    const hex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/.exec(key);
    if (!hex) return null;
    return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16), 255];
  }

  function serializeFillStyle([r, g, b, a]: [number, number, number, number]): string {
    if (a === 255) return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  function fakeContext() {
    // #000000 is what a fresh 2d context really holds, and it is the value that
    // used to be mistaken for a successful parse of junk input.
    let current: [number, number, number, number] = [0, 0, 0, 255];
    let painted: [number, number, number, number] = [0, 0, 0, 255];
    return {
      get fillStyle(): string {
        return serializeFillStyle(current);
      },
      set fillStyle(next: string) {
        const parsed = parseFillStyle(next);
        if (parsed) current = parsed;
      },
      fillRect() {
        painted = current;
      },
      getImageData() {
        return { data: painted };
      },
    };
  }

  it("resolves a CSS colour name to its channels", () => {
    expect(readCssColor(fakeContext(), "blue")).toEqual([0, 0, 255]);
    expect(readCssColor(fakeContext(), "rebeccapurple")).toEqual([102, 51, 153]);
  });

  it("resolves black rather than mistaking it for a rejected input", () => {
    expect(readCssColor(fakeContext(), "black")).toEqual([0, 0, 0]);
  });

  it("rejects input the context refuses instead of reporting the colour it kept", () => {
    // The whole point: fillStyle is unchanged by junk, so a reader that trusts
    // it hands back opaque black and the tool shows a swatch for "not a color".
    expect(readCssColor(fakeContext(), "not a color")).toBeNull();
    expect(readCssColor(fakeContext(), "")).toBeNull();
    expect(readCssColor(fakeContext(), "#12345")).toBeNull();
  });

  it("accepts a colour equal to one of the seeds it probes with", () => {
    // Knowingly coupled to PROBE_SEEDS: a single seed would read its own value
    // back and call this input invalid. Both seeds are checked so the pair
    // cannot quietly shrink to one.
    expect(readCssColor(fakeContext(), "#010203")).toEqual([1, 2, 3]);
    expect(readCssColor(fakeContext(), "#040506")).toEqual([4, 5, 6]);
  });

  it("rejects a fully transparent colour, which the tool has no format for", () => {
    expect(readCssColor(fakeContext(), "transparent")).toBeNull();
  });
});

describe("hsl round trip", () => {
  // Every hex here survives the rounding rgbToHsl does on all three channels.
  // Hexes that do not, such as #123456, drift two units of blue and are a
  // property of the rounding, not a regression this test should hide.
  const stableHexes = [
    "#ffffff",
    "#000000",
    "#808080",
    "#3b82f6",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ff8800",
  ];

  it.each(stableHexes)("returns %s to within one unit per channel", (hex) => {
    const rgb = hexToRgb(hex);
    expect(rgb).not.toBeNull();

    const [hue, saturation, lightness] = rgbToHsl(rgb![0], rgb![1], rgb![2]);
    const roundTripped = parseAnyColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    expect(roundTripped).not.toBeNull();

    for (let channel = 0; channel < 3; channel += 1) {
      expect(Math.abs(roundTripped![channel] - rgb![channel])).toBeLessThanOrEqual(1);
    }
  });
});
