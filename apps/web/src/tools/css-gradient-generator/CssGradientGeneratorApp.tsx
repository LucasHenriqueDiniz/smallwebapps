import { useState } from "react";

interface ColorStop {
  id: number;
  color: string;
  position: number;
}

let nextId = 3;

export default function CssGradientGeneratorApp() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: "#3b82f6", position: 0 },
    { id: 2, color: "#8b5cf6", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  function buildGradient() {
    const stopStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopStr})`;
    return `radial-gradient(circle, ${stopStr})`;
  }

  const css = `background: ${buildGradient()};`;

  function updateStop(id: number, field: keyof ColorStop, value: string | number) {
    setStops((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function addStop() {
    setStops((prev) => [...prev, { id: nextId++, color: "#10b981", position: 50 }]);
  }

  function removeStop(id: number) {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCopy() {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Settings</h3>

        <div className="mb-4 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(["linear", "radial"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-semibold capitalize transition ${t === type ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {type === "linear" && (
          <div className="mb-4">
            <label className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
              <span>Angle</span>
              <span>{angle}°</span>
            </label>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Color stops</span>
            <button onClick={addStop} className="text-xs font-semibold text-blue-600 hover:text-blue-700">+ Add</button>
          </div>
          {stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-2">
              <input type="color" value={stop.color} onChange={(e) => updateStop(stop.id, "color", e.target.value)} className="h-8 w-8 rounded-lg border border-slate-200 cursor-pointer shrink-0" />
              <input
                type="number"
                min={0}
                max={100}
                value={stop.position}
                onChange={(e) => updateStop(stop.id, "position", Number(e.target.value))}
                className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
              />
              <span className="text-xs text-slate-400">%</span>
              {stops.length > 2 && (
                <button onClick={() => removeStop(stop.id)} className="ml-auto text-xs text-red-400 hover:text-red-600">✕</button>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        <section
          className="rounded-2xl min-h-48 w-full"
          style={{ background: buildGradient() }}
        />
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
    </div>
  );
}
