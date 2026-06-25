import { useState, useCallback } from "react";

interface Color { hex: string; rgb: string; count: number }

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

function medianCut(pixels: [number, number, number][], numColors: number): [number, number, number][] {
  if (pixels.length === 0) return [];

  function split(bucket: [number, number, number][]): [[number, number, number][], [number, number, number][]] {
    let maxRange = 0, splitChannel = 0;
    for (let c = 0; c < 3; c++) {
      const vals = bucket.map(p => p[c]);
      const range = Math.max(...vals) - Math.min(...vals);
      if (range > maxRange) { maxRange = range; splitChannel = c; }
    }
    bucket.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const mid = Math.floor(bucket.length / 2);
    return [bucket.slice(0, mid), bucket.slice(mid)];
  }

  let buckets: [number, number, number][][] = [pixels];
  while (buckets.length < numColors) {
    const largest = buckets.reduce((a, b) => a.length > b.length ? a : b);
    const idx = buckets.indexOf(largest);
    buckets.splice(idx, 1, ...split(largest));
  }

  return buckets.map(bucket => {
    const avg = bucket.reduce((acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]] as [number, number, number], [0, 0, 0] as [number, number, number]);
    return [Math.round(avg[0]/bucket.length), Math.round(avg[1]/bucket.length), Math.round(avg[2]/bucket.length)] as [number, number, number];
  });
}

function extractColors(img: HTMLImageElement, numColors = 8): Color[] {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 200 / Math.max(img.width, img.height));
  canvas.width = Math.floor(img.width * scale);
  canvas.height = Math.floor(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4 * 3) {
    if (data[i + 3] > 128) pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  const palette = medianCut(pixels, numColors);

  // Count which pixels belong to each palette color
  const counts = new Array(palette.length).fill(0) as number[];
  for (const p of pixels) {
    let minDist = Infinity, closest = 0;
    palette.forEach((c, i) => { const d = colorDistance(p, c); if (d < minDist) { minDist = d; closest = i; } });
    counts[closest]++;
  }

  return palette
    .map((c, i) => ({
      hex: rgbToHex(c[0], c[1], c[2]),
      rgb: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
      count: counts[i],
    }))
    .sort((a, b) => b.count - a.count);
}

export default function ColorPaletteExtractorApp() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImgSrc(url);
      setColors(extractColors(img));
    };
    img.src = url;
  }, []);

  function copyCss() {
    const css = colors.map((c, i) => `--color-${(i + 1) * 100}: ${c.hex};`).join("\n");
    navigator.clipboard.writeText(`:root {\n${css}\n}`).then(() => {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 1800);
    });
  }

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = () => { const f = inp.files?.[0]; if (f) processFile(f); }; inp.click(); }}
      >
        <p className="text-sm font-medium text-slate-700">Drop an image or click to browse</p>
        <p className="mt-1 text-xs text-slate-400">JPEG, PNG, WebP supported</p>
      </section>

      {imgSrc && <img src={imgSrc} alt="Uploaded" className="max-h-48 rounded-xl object-contain mx-auto" />}

      {colors.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Dominant Colors</h3>
            <button onClick={copyCss} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              {copiedCss ? "✓ Copied" : "Export as CSS vars"}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <div key={color.hex} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => copyHex(color.hex)}
                  className="h-16 w-16 rounded-xl border border-slate-200 shadow-sm transition hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                  title={`Copy ${color.hex}`}
                />
                <div className="text-center">
                  <p className="text-xs font-mono font-medium text-slate-800">
                    {copiedHex === color.hex ? "✓ Copied" : color.hex}
                  </p>
                  <p className="text-xs text-slate-400">{color.rgb}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
