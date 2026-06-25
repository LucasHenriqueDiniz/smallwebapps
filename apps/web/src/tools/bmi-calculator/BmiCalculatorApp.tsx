import { useMemo, useState } from "react";

function calcBMI(weightKg: number, heightM: number) {
  return weightKg / (heightM * heightM);
}

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-500 text-white" };
  if (bmi < 25) return { label: "Normal weight", color: "bg-emerald-500 text-white" };
  if (bmi < 30) return { label: "Overweight", color: "bg-amber-400 text-white" };
  return { label: "Obese", color: "bg-red-500 text-white" };
}

function healthyWeightRange(heightM: number) {
  const low = (18.5 * heightM * heightM).toFixed(1);
  const high = (24.9 * heightM * heightM).toFixed(1);
  return `${low} – ${high} kg`;
}

export default function BmiCalculatorApp() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weightKg, setWeightKg] = useState("70");
  const [heightCm, setHeightCm] = useState("175");
  const [weightLbs, setWeightLbs] = useState("154");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");

  const result = useMemo(() => {
    let wKg: number, hM: number;
    if (unit === "metric") {
      wKg = parseFloat(weightKg);
      hM = parseFloat(heightCm) / 100;
    } else {
      wKg = parseFloat(weightLbs) * 0.453592;
      const totalInches = parseFloat(feet) * 12 + parseFloat(inches);
      hM = totalInches * 0.0254;
    }
    if (isNaN(wKg) || isNaN(hM) || hM <= 0 || wKg <= 0) return null;
    const bmi = calcBMI(wKg, hM);
    const category = getBMICategory(bmi);
    const range = healthyWeightRange(hM);
    return { bmi: bmi.toFixed(1), category, range };
  }, [unit, weightKg, heightCm, weightLbs, feet, inches]);

  const bmiVal = result ? parseFloat(result.bmi) : 0;
  const barPct = Math.min(100, Math.max(0, ((bmiVal - 10) / 40) * 100));

  return (
    <div className="mx-auto max-w-md grid gap-5">
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {["metric", "imperial"].map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u as "metric" | "imperial")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${u === unit ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
          >
            {u}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Measurements</h3>
        {unit === "metric" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Weight (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Height (cm)</label>
              <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Weight (lbs)</label>
              <input type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Feet</label>
              <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Inches</label>
              <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
          </div>
        )}
      </section>

      {result && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 text-center">
            <div className="text-4xl font-bold text-slate-950">{result.bmi}</div>
            <div className="mt-1 text-sm text-slate-500">BMI</div>
            <span className={`mt-2 inline-block rounded-full px-4 py-1 text-sm font-semibold ${result.category.color}`}>
              {result.category.label}
            </span>
          </div>

          <div className="mb-4">
            <div className="relative h-3 w-full rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-500">
              <div
                className="absolute top-0 h-full w-1 bg-white shadow"
                style={{ left: `${barPct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>10</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>50</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Healthy weight range: </span>
            <span className="font-semibold text-slate-950">{result.range}</span>
          </div>
        </section>
      )}
    </div>
  );
}
