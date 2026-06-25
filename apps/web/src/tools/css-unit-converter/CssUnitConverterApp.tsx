import { useState } from "react";

type Unit = "px" | "rem" | "em" | "%" | "vh" | "vw" | "pt" | "cm" | "mm" | "in";

const UNITS: Unit[] = ["px", "rem", "em", "%", "vh", "vw", "pt", "cm", "mm", "in"];

const PX_PER: Record<string, number> = {
  px: 1,
  pt: 96 / 72,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  in: 96,
};

export default function CssUnitConverterApp() {
  const [value, setValue] = useState("16");
  const [unit, setUnit] = useState<Unit>("px");
  const [baseFontPx, setBaseFontPx] = useState(16);
  const [viewportW, setViewportW] = useState(1440);
  const [viewportH, setViewportH] = useState(900);
  const [parentPx, setParentPx] = useState(16);

  const num = parseFloat(value) || 0;

  function toPx(v: number, u: Unit): number {
    switch (u) {
      case "px": return v;
      case "rem": return v * baseFontPx;
      case "em": return v * parentPx;
      case "%": return v * parentPx / 100;
      case "vh": return v * viewportH / 100;
      case "vw": return v * viewportW / 100;
      case "pt": return v * PX_PER.pt;
      case "cm": return v * PX_PER.cm;
      case "mm": return v * PX_PER.mm;
      case "in": return v * PX_PER.in;
      default: return v;
    }
  }

  function fromPx(px: number, u: Unit): number {
    switch (u) {
      case "px": return px;
      case "rem": return px / baseFontPx;
      case "em": return px / parentPx;
      case "%": return (px / parentPx) * 100;
      case "vh": return (px / viewportH) * 100;
      case "vw": return (px / viewportW) * 100;
      case "pt": return px / PX_PER.pt;
      case "cm": return px / PX_PER.cm;
      case "mm": return px / PX_PER.mm;
      case "in": return px / PX_PER.in;
      default: return px;
    }
  }

  const px = toPx(num, unit);

  function fmt(n: number): string {
    if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(3);
    return parseFloat(n.toPrecision(6)).toString();
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Input</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Value</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-32 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Context</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { label: "Base font size (px)", value: baseFontPx, set: setBaseFontPx },
            { label: "Parent element (px)", value: parentPx, set: setParentPx },
            { label: "Viewport width (px)", value: viewportW, set: setViewportW },
            { label: "Viewport height (px)", value: viewportH, set: setViewportH },
          ].map(({ label, value: v, set }) => (
            <div key={label}>
              <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
              <input type="number" value={v} onChange={(e) => set(Number(e.target.value))} className="w-28 rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">All Equivalents</h3>
        <div className="divide-y divide-slate-100">
          {UNITS.map((u) => (
            <div key={u} className={`flex items-center justify-between py-2.5 ${u === unit ? "font-semibold" : ""}`}>
              <span className="text-sm text-slate-600">{u}</span>
              <span className="font-mono text-sm text-slate-800">
                {fmt(fromPx(px, u))} {u}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
