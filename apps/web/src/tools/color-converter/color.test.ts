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
  });

  it("returns null for text that is not a color", () => {
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
