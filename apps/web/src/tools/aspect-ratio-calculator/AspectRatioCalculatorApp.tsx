import { useMemo, useState } from "react";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

const PRESETS = [
  { label: "16:9", w: 1920, h: 1080 },
  { label: "4:3", w: 1280, h: 960 },
  { label: "1:1", w: 1000, h: 1000 },
  { label: "21:9", w: 2560, h: 1080 },
  { label: "3:2", w: 1500, h: 1000 },
];

export default function AspectRatioCalculatorApp() {
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [scaleW, setScaleW] = useState("1280");
  const [scaleH, setScaleH] = useState("");

  const ratio = useMemo(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
    const g = gcd(Math.round(w), Math.round(h));
    return { ratioW: Math.round(w) / g, ratioH: Math.round(h) / g, decimal: w / h };
  }, [width, height]);

  const scaledH = useMemo(() => {
    if (!ratio || !scaleW) return "";
    const w = parseFloat(scaleW);
    if (isNaN(w)) return "";
    return (w / ratio.decimal).toFixed(2);
  }, [ratio, scaleW]);

  const scaledW = useMemo(() => {
    if (!ratio || !scaleH) return "";
    const h = parseFloat(scaleH);
    if (isNaN(h)) return "";
    return (h * ratio.decimal).toFixed(2);
  }, [ratio, scaleH]);

  const previewW = 200;
  const previewH = ratio ? Math.round(previewW / ratio.decimal) : 113;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Dimensions</h3>
          <div className="flex items-center gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200"
              />
            </div>
            <span className="mt-4 text-slate-400">×</span>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setWidth(String(p.w)); setHeight(String(p.h)); }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {ratio && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="rounded-xl bg-blue-50 px-4 py-2">
                <span className="text-xs text-blue-500">Ratio</span>
                <div className="text-lg font-bold text-blue-700">{ratio.ratioW}:{ratio.ratioH}</div>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-2">
                <span className="text-xs text-slate-500">Decimal</span>
                <div className="text-lg font-bold text-slate-950">{ratio.decimal.toFixed(4)}</div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Scale to</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Width</label>
              <input
                type="number"
                value={scaleW}
                onChange={(e) => { setScaleW(e.target.value); setScaleH(""); }}
                className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200"
              />
            </div>
            <span className="mb-2.5 text-slate-400">→ H: <strong>{scaledH || "—"}</strong></span>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Height</label>
              <input
                type="number"
                value={scaleH}
                onChange={(e) => { setScaleH(e.target.value); setScaleW(""); }}
                className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200"
              />
            </div>
            <span className="mb-2.5 text-slate-400">→ W: <strong>{scaledW || "—"}</strong></span>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-center justify-center gap-4">
        <h3 className="text-sm font-semibold text-slate-950">Preview</h3>
        <div
          className="border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center rounded-lg"
          style={{ width: previewW, height: Math.min(previewH, 300) }}
        >
          <span className="text-xs text-blue-400">{ratio ? `${ratio.ratioW}:${ratio.ratioH}` : "?"}</span>
        </div>
        <p className="text-xs text-slate-400">{width} × {height}px</p>
      </section>
    </div>
  );
}
