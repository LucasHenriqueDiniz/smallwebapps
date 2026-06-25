import { useState } from "react";

type UnitDef = { label: string; toBase: (v: number) => number; fromBase: (v: number) => number };
type Category = { name: string; units: UnitDef[] };

const categories: Category[] = [
  {
    name: "Length",
    units: [
      { label: "Meters (m)", toBase: (v) => v, fromBase: (v) => v },
      { label: "Kilometers (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { label: "Centimeters (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { label: "Millimeters (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { label: "Miles (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { label: "Yards (yd)", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { label: "Feet (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { label: "Inches (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ],
  },
  {
    name: "Weight",
    units: [
      { label: "Kilograms (kg)", toBase: (v) => v, fromBase: (v) => v },
      { label: "Grams (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { label: "Milligrams (mg)", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { label: "Pounds (lb)", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      { label: "Ounces (oz)", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { label: "Tonnes (t)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  {
    name: "Temperature",
    units: [
      { label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
      { label: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    name: "Area",
    units: [
      { label: "Square meters (m²)", toBase: (v) => v, fromBase: (v) => v },
      { label: "Square km (km²)", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { label: "Square feet (ft²)", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { label: "Square yards (yd²)", toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
      { label: "Acres", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { label: "Hectares", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  {
    name: "Volume",
    units: [
      { label: "Liters (L)", toBase: (v) => v, fromBase: (v) => v },
      { label: "Milliliters (mL)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { label: "Cubic meters (m³)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { label: "Gallons (US)", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { label: "Fluid ounces (fl oz)", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
      { label: "Cups (US)", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    ],
  },
  {
    name: "Speed",
    units: [
      { label: "m/s", toBase: (v) => v, fromBase: (v) => v },
      { label: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { label: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { label: "Knots", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      { label: "Mach", toBase: (v) => v * 340.29, fromBase: (v) => v / 340.29 },
    ],
  },
];

export default function UnitConverterApp() {
  const [catIdx, setCatIdx] = useState(0);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [inputVal, setInputVal] = useState("1");

  const cat = categories[catIdx];
  const num = parseFloat(inputVal);
  const result = isNaN(num) ? "" : (() => {
    const base = cat.units[fromIdx].toBase(num);
    const out = cat.units[toIdx].fromBase(base);
    return Number.isFinite(out) ? parseFloat(out.toPrecision(10)).toString() : "—";
  })();

  return (
    <div className="mx-auto max-w-xl grid gap-5">
      <div className="flex flex-wrap gap-2">
        {categories.map((c, i) => (
          <button
            key={c.name}
            onClick={() => { setCatIdx(i); setFromIdx(0); setToIdx(1); }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${i === catIdx ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">From</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
              />
              <select
                value={fromIdx}
                onChange={(e) => setFromIdx(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
              >
                {cat.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={() => { setFromIdx(toIdx); setToIdx(fromIdx); }}
              className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition"
              title="Swap"
            >
              ⇅
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">To</label>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 outline-none">
                {result || "—"}
              </div>
              <select
                value={toIdx}
                onChange={(e) => setToIdx(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
              >
                {cat.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
