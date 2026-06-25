import { useState } from "react";

export default function CssBorderRadiusApp() {
  const [linked, setLinked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);
  const [copied, setCopied] = useState(false);

  function setAll(val: number) {
    setTl(val); setTr(val); setBr(val); setBl(val);
  }

  function handleChange(setter: (v: number) => void, val: number) {
    if (linked) {
      setAll(val);
    } else {
      setter(val);
    }
  }

  const max = unit === "px" ? 200 : 50;

  function buildCss() {
    if (tl === tr && tr === br && br === bl) return `${tl}${unit}`;
    return `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`;
  }

  const css = `border-radius: ${buildCss()};`;

  function handleCopy() {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const corners = [
    { label: "Top-left", val: tl, setter: setTl },
    { label: "Top-right", val: tr, setter: setTr },
    { label: "Bottom-right", val: br, setter: setBr },
    { label: "Bottom-left", val: bl, setter: setBl },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["px", "%"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${u === unit ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
              >
                {u}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} />
            Link all corners
          </label>
        </div>

        <div className="space-y-4">
          {corners.map(({ label, val, setter }) => (
            <div key={label}>
              <label className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                <span>{label}</span>
                <span>{val}{unit}</span>
              </label>
              <input
                type="range"
                min={0}
                max={max}
                value={val}
                onChange={(e) => handleChange(setter, Number(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-center min-h-48">
          <div
            className="h-40 w-40 bg-blue-200"
            style={{ borderRadius: buildCss() }}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-950">CSS</h3>
            <button onClick={handleCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div className="rounded-xl bg-slate-950 px-3 py-2.5 font-mono text-sm text-emerald-400 break-all">
            {css}
          </div>
        </section>
      </div>
    </div>
  );
}
