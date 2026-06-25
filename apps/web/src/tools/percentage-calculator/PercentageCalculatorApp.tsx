import { useState } from "react";

function fmt(n: number) {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

export default function PercentageCalculatorApp() {
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  const [a1, setA1] = useState("25");
  const [b1, setB1] = useState("200");

  const [a2, setA2] = useState("50");
  const [b2, setB2] = useState("200");

  const [a3, setA3] = useState("100");
  const [b3, setB3] = useState("150");

  const result1 = (() => {
    const x = parseFloat(a1), y = parseFloat(b1);
    if (isNaN(x) || isNaN(y)) return "—";
    return fmt((x / 100) * y);
  })();

  const result2 = (() => {
    const x = parseFloat(a2), y = parseFloat(b2);
    if (isNaN(x) || isNaN(y) || y === 0) return "—";
    return fmt((x / y) * 100) + "%";
  })();

  const result3 = (() => {
    const x = parseFloat(a3), y = parseFloat(b3);
    if (isNaN(x) || isNaN(y) || x === 0) return "—";
    const change = ((y - x) / x) * 100;
    return fmt(change) + "% " + (change >= 0 ? "increase" : "decrease");
  })();

  const tabs = [
    { label: "X% of Y" },
    { label: "X is ?% of Y" },
    { label: "% Change" },
  ];

  return (
    <div className="mx-auto max-w-md grid gap-5">
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {tabs.map(({ label }, i) => (
          <button
            key={label}
            onClick={() => setTab(i as 0 | 1 | 2)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${i === tab ? "bg-white shadow text-slate-950" : "text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">What is X% of Y?</h3>
          <div className="flex flex-wrap items-center gap-3">
            <input type="number" value={a1} onChange={(e) => setA1(e.target.value)} className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" placeholder="X" />
            <span className="text-sm text-slate-500">% of</span>
            <input type="number" value={b1} onChange={(e) => setB1(e.target.value)} className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" placeholder="Y" />
            <span className="text-sm text-slate-500">=</span>
            <span className="text-xl font-bold text-blue-700">{result1}</span>
          </div>
        </section>
      )}

      {tab === 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">X is what % of Y?</h3>
          <div className="flex flex-wrap items-center gap-3">
            <input type="number" value={a2} onChange={(e) => setA2(e.target.value)} className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" placeholder="X" />
            <span className="text-sm text-slate-500">is</span>
            <span className="text-xl font-bold text-blue-700">{result2}</span>
            <span className="text-sm text-slate-500">of</span>
            <input type="number" value={b2} onChange={(e) => setB2(e.target.value)} className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" placeholder="Y" />
          </div>
        </section>
      )}

      {tab === 2 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Percentage change from X to Y</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">From</span>
            <input type="number" value={a3} onChange={(e) => setA3(e.target.value)} className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" placeholder="X" />
            <span className="text-sm text-slate-500">to</span>
            <input type="number" value={b3} onChange={(e) => setB3(e.target.value)} className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" placeholder="Y" />
            <span className="text-sm text-slate-500">=</span>
            <span className="text-xl font-bold text-blue-700">{result3}</span>
          </div>
        </section>
      )}
    </div>
  );
}
