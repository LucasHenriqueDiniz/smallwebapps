import { useState, useMemo } from "react";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
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

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `#${[f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ColorShadesApp() {
  const [base, setBase] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedCss, setCopiedCss] = useState(false);

  const palette = useMemo(() => {
    try {
      const [h, s] = hexToHsl(base);
      const result: { label: string; hex: string; num: number }[] = [];
      // 50, 100, 200, ..., 900, 950 — lighter shades first
      const steps = [
        { num: 50, l: 97 }, { num: 100, l: 94 }, { num: 200, l: 86 },
        { num: 300, l: 74 }, { num: 400, l: 62 }, { num: 500, l: 50 },
        { num: 600, l: 42 }, { num: 700, l: 34 }, { num: 800, l: 26 },
        { num: 900, l: 18 }, { num: 950, l: 12 },
      ];
      for (const { num, l } of steps) {
        result.push({ label: num.toString(), hex: hslToHex(h, s, l), num });
      }
      return result;
    } catch {
      return [];
    }
  }, [base]);

  function copy(val: string) {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(val);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  function copyCssVars() {
    const css = palette.map(p => `  --color-${p.label}: ${p.hex};`).join("\n");
    navigator.clipboard.writeText(`:root {\n${css}\n}`).then(() => {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 1800);
    });
  }

  function handleHexInput(val: string) {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setBase(val);
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Base Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={base} onChange={(e) => { setBase(e.target.value); setHexInput(e.target.value.toUpperCase()); }} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 p-1" />
              <input type="text" value={hexInput} onChange={(e) => handleHexInput(e.target.value)} maxLength={7} className="w-28 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" placeholder="#3b82f6" />
            </div>
          </div>
          <button onClick={copyCssVars} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copiedCss ? "✓ Copied CSS vars" : "Copy as CSS variables"}
          </button>
        </div>
      </section>

      {palette.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Palette</h3>
          <div className="grid gap-2">
            <div className="flex gap-1">
              {palette.map(p => (
                <div key={p.num} className="flex-1 flex flex-col gap-1">
                  <button
                    onClick={() => copy(p.hex)}
                    style={{ backgroundColor: p.hex }}
                    className="h-12 rounded-lg w-full border border-slate-200/50 transition hover:scale-105 hover:shadow-md"
                    title={p.hex}
                  />
                  <p className="text-center text-xs font-medium text-slate-600">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {palette.map(p => (
              <div key={p.num} className="flex items-center gap-3">
                <div className="h-6 w-6 shrink-0 rounded border border-slate-200" style={{ backgroundColor: p.hex }} />
                <span className="w-10 text-xs text-slate-500">{p.label}</span>
                <button onClick={() => copy(p.hex)} className="font-mono text-xs text-slate-700 hover:text-blue-600">
                  {copied === p.hex ? "✓ Copied" : p.hex}
                </button>
                <span className="text-xs text-slate-400">{hexToRgb(p.hex)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
