import { useMemo, useRef, useState } from "react";
import { parseAnyColor, rgbToCmyk, rgbToHsl, rgbToHsv } from "@/tools/color-converter/color";

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
