import { useMemo, useState } from "react";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (v: number) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ContrastCheckerApp() {
  const [fg, setFg] = useState("#1e293b");
  const [bg, setBg] = useState("#f8fafc");
  const [fgInput, setFgInput] = useState("#1e293b");
  const [bgInput, setBgInput] = useState("#f8fafc");

  function handleFgInput(val: string) {
    setFgInput(val);
    if (/^#[0-9a-f]{6}$/i.test(val)) setFg(val);
  }

  function handleBgInput(val: string) {
    setBgInput(val);
    if (/^#[0-9a-f]{6}$/i.test(val)) setBg(val);
  }

  const result = useMemo(() => {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;
    const lFg = relativeLuminance(...fgRgb);
    const lBg = relativeLuminance(...bgRgb);
    const ratio = contrastRatio(lFg, lBg);

    return {
      ratio: ratio.toFixed(2),
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
    };
  }, [fg, bg]);

  const check = (pass: boolean) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${pass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
      {pass ? "Pass" : "Fail"}
    </span>
  );

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Foreground</label>
            <div className="flex items-center gap-2">
              <input type="color" value={fg} onChange={(e) => { setFg(e.target.value); setFgInput(e.target.value); }} className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer" />
              <input type="text" value={fgInput} onChange={(e) => handleFgInput(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Background</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bg} onChange={(e) => { setBg(e.target.value); setBgInput(e.target.value); }} className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer" />
              <input type="text" value={bgInput} onChange={(e) => handleBgInput(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5" style={{ background: bg }}>
        <p className="text-4xl font-bold" style={{ color: fg }}>Aa</p>
        <p className="mt-2 text-base" style={{ color: fg }}>The quick brown fox jumps over the lazy dog.</p>
        <p className="mt-1 text-sm" style={{ color: fg }}>Small text sample at 14px.</p>
      </section>

      {result && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 text-center">
            <div className="text-4xl font-bold text-slate-950">{result.ratio}:1</div>
            <div className="text-sm text-slate-500">Contrast ratio</div>
          </div>
          <div className="space-y-2">
            {[
              { label: "WCAG AA — Normal text (≥4.5:1)", pass: result.aaNormal },
              { label: "WCAG AA — Large text (≥3:1)", pass: result.aaLarge },
              { label: "WCAG AAA — Normal text (≥7:1)", pass: result.aaaNormal },
              { label: "WCAG AAA — Large text (≥4.5:1)", pass: result.aaaLarge },
            ].map(({ label, pass }) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="text-sm text-slate-700">{label}</span>
                {check(pass)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
