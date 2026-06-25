import { useState } from "react";

interface Shadow {
  id: number;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

let nextId = 2;

function shadowToCSS(s: Shadow): string {
  const hex = s.color;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const alpha = (s.opacity / 100).toFixed(2);
  return `${s.inset ? "inset " : ""}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px rgba(${r},${g},${b},${alpha})`;
}

export default function CssShadowGeneratorApp() {
  const [shadows, setShadows] = useState<Shadow[]>([
    { id: 1, offsetX: 0, offsetY: 4, blur: 24, spread: 0, color: "#000000", opacity: 15, inset: false },
  ]);
  const [copied, setCopied] = useState(false);

  const cssValue = shadows.map(shadowToCSS).join(", ");
  const css = `box-shadow: ${cssValue};`;

  function updateShadow(id: number, field: keyof Shadow, value: number | string | boolean) {
    setShadows((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function addShadow() {
    setShadows((prev) => [...prev, { id: nextId++, offsetX: 4, offsetY: 4, blur: 8, spread: 0, color: "#000000", opacity: 20, inset: false }]);
  }

  function removeShadow(id: number) {
    setShadows((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCopy() {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-center min-h-48">
          <div
            className="h-32 w-48 rounded-2xl bg-white"
            style={{ boxShadow: cssValue }}
          />
        </section>

        <div className="space-y-4">
          {shadows.map((s) => (
            <section key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-950">Shadow</span>
                <div className="flex gap-2">
                  <label className="flex cursor-pointer items-center gap-1 text-xs text-slate-600">
                    <input type="checkbox" checked={s.inset} onChange={(e) => updateShadow(s.id, "inset", e.target.checked)} />
                    Inset
                  </label>
                  {shadows.length > 0 && (
                    <button onClick={() => removeShadow(s.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {([
                  { label: "Offset X (px)", field: "offsetX" as const, min: -100, max: 100 },
                  { label: "Offset Y (px)", field: "offsetY" as const, min: -100, max: 100 },
                  { label: "Blur (px)", field: "blur" as const, min: 0, max: 100 },
                  { label: "Spread (px)", field: "spread" as const, min: -50, max: 50 },
                  { label: "Opacity (%)", field: "opacity" as const, min: 0, max: 100 },
                ] as const).map(({ label, field, min, max }) => (
                  <div key={field}>
                    <label className="mb-1 block text-slate-500">{label}: {s[field]}</label>
                    <input type="range" min={min} max={max} value={s[field] as number} onChange={(e) => updateShadow(s.id, field, Number(e.target.value))} className="w-full" />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-slate-500">Color</label>
                  <input type="color" value={s.color} onChange={(e) => updateShadow(s.id, "color", e.target.value)} className="h-8 w-full rounded-lg border border-slate-200 cursor-pointer" />
                </div>
              </div>
            </section>
          ))}
          <button onClick={addShadow} className="w-full rounded-xl border-2 border-dashed border-slate-200 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">
            + Add shadow
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-950">CSS output</h3>
          <button onClick={handleCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div className="rounded-xl bg-slate-950 px-4 py-3 font-mono text-sm text-emerald-400 break-all">
          {css}
        </div>
      </section>
    </div>
  );
}
