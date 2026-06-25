import { useMemo, useRef, useState } from "react";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
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

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

function parseAnyColor(input: string): [number, number, number] | null {
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
  // CSS named color via canvas
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = s;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return null;
    return [r, g, b];
  } catch { return null; }
}

export default function ColorConverterApp() {
  const [input, setInput] = useState("#3b82f6");
  const [pickerVal, setPickerVal] = useState("#3b82f6");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  const rgb = useMemo(() => parseAnyColor(input), [input]);

  const formats = useMemo(() => {
    if (!rgb) return null;
    const [r, g, b] = rgb;
    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    const [h, s, l] = rgbToHsl(r, g, b);
    const [hv, sv, v] = rgbToHsv(r, g, b);
    const [c, m, y, k] = rgbToCmyk(r, g, b);
    return {
      HEX: hex,
      RGB: `rgb(${r}, ${g}, ${b})`,
      HSL: `hsl(${h}, ${s}%, ${l}%)`,
      HSV: `hsv(${hv}, ${sv}%, ${v}%)`,
      CMYK: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`,
    };
  }, [rgb]);

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPickerVal(e.target.value);
    setInput(e.target.value);
  }

  function copyFormat(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  const swatchColor = rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : "#e2e8f0";

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div
          className="mb-4 h-20 w-full rounded-xl cursor-pointer transition"
          style={{ background: swatchColor }}
          onClick={() => pickerRef.current?.click()}
          title="Click to open color picker"
        />
        <input ref={pickerRef} type="color" value={pickerVal} onChange={handlePickerChange} className="sr-only" />
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Enter any color (HEX, rgb(), hsl(), CSS name)</label>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            const rgb2 = parseAnyColor(e.target.value);
            if (rgb2) {
              const h = "#" + rgb2.map((v) => v.toString(16).padStart(2, "0")).join("");
              setPickerVal(h);
            }
          }}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="#3b82f6 or rgb(59,130,246) or blue"
        />
        {input && !rgb && (
          <p className="mt-1 text-xs text-red-600">Could not parse this color format.</p>
        )}
      </section>

      {formats && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Converted formats</h3>
          <div className="space-y-3">
            {Object.entries(formats).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="w-12 shrink-0 text-xs font-semibold text-slate-500">{key}</span>
                <span className="flex-1 font-mono text-sm text-slate-800">{value}</span>
                <button
                  onClick={() => copyFormat(key, value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
                >
                  {copiedKey === key ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
