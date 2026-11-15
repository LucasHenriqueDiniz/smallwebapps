/**
 * What any image file says about itself, EXIF or not: the figures the retired
 * Image Metadata Viewer showed, moved here when it was merged into this tool
 * (2026-11-15). Same formulas, so a photo reads the same on both.
 */

export type FileFact = { label: string; value: string };

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** "4:3" for 4032 × 3024. */
export function aspectRatio(width: number, height: number): string {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/** Millions of pixels, two decimals: 12.19 for 4032 × 3024. */
export function megapixels(width: number, height: number): number {
  return parseFloat(((width * height) / 1_000_000).toFixed(2));
}

export function fileFacts(
  file: { name: string; size: number; type: string; lastModified: number },
  pixels: { width: number; height: number } | null,
): FileFact[] {
  return [
    { label: "File name", value: file.name },
    { label: "File size", value: formatSize(file.size) },
    { label: "MIME type", value: file.type || "unknown" },
    ...(pixels
      ? [
          { label: "Dimensions", value: `${pixels.width} × ${pixels.height} px` },
          { label: "Aspect ratio", value: aspectRatio(pixels.width, pixels.height) },
          { label: "Megapixels", value: `${megapixels(pixels.width, pixels.height)} MP` },
        ]
      : []),
    { label: "Last modified", value: new Date(file.lastModified).toLocaleString() },
  ];
}
