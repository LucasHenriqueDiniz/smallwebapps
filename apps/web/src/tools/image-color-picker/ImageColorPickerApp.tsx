import { useRef, useState } from "react";

interface PinnedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
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
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ImageColorPickerApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [pinnedColors, setPinnedColors] = useState<PinnedColor[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }

  function getPixelAt(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d")!;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return { r, g, b };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    setHoverColor(getPixelAt(e));
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const color = getPixelAt(e);
    if (pinnedColors.length >= 10) return;
    const hex = rgbToHex(color.r, color.g, color.b);
    setPinnedColors((prev) => [...prev, { hex, ...color }]);
  }

  function copyHex(i: number) {
    navigator.clipboard.writeText(pinnedColors[i].hex).then(() => {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  }

  const hoverHex = hoverColor ? rgbToHex(hoverColor.r, hoverColor.g, hoverColor.b) : null;

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:bg-slate-100 transition">
          Click to upload image
        </button>
      </section>

      {imageSrc && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-2 text-xs text-slate-500">Move over the image to pick a color. Click to pin it to the palette (up to 10).</p>
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              className="max-h-80 w-full rounded-xl object-contain border border-slate-100 cursor-crosshair"
              style={{ imageRendering: "pixelated" }}
            />
            {hoverColor && (
              <div className="absolute top-2 left-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm pointer-events-none">
                <div className="h-5 w-5 rounded-md border border-slate-200" style={{ background: hoverHex ?? "" }} />
                <span className="font-mono text-xs font-semibold text-slate-800">{hoverHex}</span>
                <span className="text-xs text-slate-500">{rgbToHsl(hoverColor.r, hoverColor.g, hoverColor.b)}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {pinnedColors.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Pinned palette</h3>
            <button onClick={() => setPinnedColors([])} className="text-xs text-slate-400 hover:text-red-500">Clear</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {pinnedColors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-12 w-12 rounded-xl border border-slate-200" style={{ background: c.hex }} />
                <span className="font-mono text-xs text-slate-700">{c.hex}</span>
                <button
                  onClick={() => copyHex(i)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {copiedIdx === i ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
