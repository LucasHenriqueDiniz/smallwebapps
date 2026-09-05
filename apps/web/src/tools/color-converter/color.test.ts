import { describe, expect, it } from "vitest";
import { hexToRgb, parseAnyColor, rgbToCmyk, rgbToHsl, rgbToHsv } from "@/tools/color-converter/color";

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

  // ⚠️ This pins the Node fallback, NOT what a visitor gets. parseAnyColor's last
  // branch resolves CSS named colours through a canvas, so under vitest's "node"
  // environment `document` is undefined, the try throws, and the catch returns
  // null. In a browser the same input takes the branch: assigning an invalid
  // value to ctx.fillStyle leaves it at the default #000000, alpha comes back
  // 255, and the function returns [0, 0, 0] — the tool silently shows black for
  // junk input instead of reporting it. Probed in Chrome; see the note in
  // color.ts. Do not rename this to claim the function returns null.
  it("falls back to null when no canvas is available to resolve a named colour", () => {
    expect(parseAnyColor("not a color")).toBeNull();
    expect(parseAnyColor("")).toBeNull();
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
