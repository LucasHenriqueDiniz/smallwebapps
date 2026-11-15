import { describe, expect, it } from "vitest";
import { aspectRatio, fileFacts, formatSize, megapixels } from "@/tools/exif-viewer/file-facts";

describe("file facts", () => {
  it("formats sizes in B, KB and MB", () => {
    expect(formatSize(512)).toBe("512 B");
    expect(formatSize(1536)).toBe("1.5 KB");
    expect(formatSize(3 * 1024 * 1024 + 512 * 1024)).toBe("3.50 MB");
  });

  it("reduces the aspect ratio and rounds megapixels to two decimals", () => {
    expect(aspectRatio(4032, 3024)).toBe("4:3");
    expect(aspectRatio(1920, 1080)).toBe("16:9");
    expect(megapixels(4032, 3024)).toBe(12.19);
  });

  it("lists the file's own facts, and the pixel ones only when the image decoded", () => {
    const file = { name: "shot.png", size: 2048, type: "image/png", lastModified: 0 };
    expect(fileFacts(file, { width: 800, height: 600 }).map((fact) => fact.label)).toEqual([
      "File name", "File size", "MIME type", "Dimensions", "Aspect ratio", "Megapixels", "Last modified",
    ]);
    expect(fileFacts(file, null).map((fact) => fact.label)).toEqual([
      "File name", "File size", "MIME type", "Last modified",
    ]);
    expect(fileFacts({ ...file, type: "" }, null)[2].value).toBe("unknown");
  });
});
