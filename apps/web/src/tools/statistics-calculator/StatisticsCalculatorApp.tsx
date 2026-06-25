import { useMemo, useState } from "react";

function parseNumbers(text: string): number[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

function calcStats(nums: number[]) {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  const freqMap: Record<number, number> = {};
  for (const v of sorted) freqMap[v] = (freqMap[v] ?? 0) + 1;
  const maxFreq = Math.max(...Object.values(freqMap));
  const modes = Object.entries(freqMap).filter(([, f]) => f === maxFreq).map(([v]) => Number(v));

  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const q1 = sorted[Math.floor(n / 4)];
  const q3 = sorted[Math.floor((3 * n) / 4)];

  return {
    count: n,
    sum,
    mean,
    median,
    mode: modes.length === n ? "No mode" : modes.slice(0, 3).join(", "),
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    variance,
    stdDev,
    q1,
    q3,
    iqr: q3 - q1,
  };
}

function fmt(n: number) {
  return parseFloat(n.toPrecision(8)).toString();
}

export default function StatisticsCalculatorApp() {
  const [input, setInput] = useState("4, 7, 2, 9, 1, 5, 7, 3, 8, 6");
  const [copied, setCopied] = useState(false);

  const numbers = useMemo(() => parseNumbers(input), [input]);
  const stats = useMemo(() => calcStats(numbers), [numbers]);

  function handleCopyStats() {
    if (!stats) return;
    const text = Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const statRows = stats ? [
    { label: "Count", value: stats.count },
    { label: "Sum", value: fmt(stats.sum) },
    { label: "Mean", value: fmt(stats.mean) },
    { label: "Median", value: fmt(stats.median) },
    { label: "Mode", value: stats.mode },
    { label: "Min", value: fmt(stats.min) },
    { label: "Max", value: fmt(stats.max) },
    { label: "Range", value: fmt(stats.range) },
    { label: "Variance", value: fmt(stats.variance) },
    { label: "Std. Deviation", value: fmt(stats.stdDev) },
    { label: "Q1", value: fmt(stats.q1) },
    { label: "Q3", value: fmt(stats.q3) },
    { label: "IQR", value: fmt(stats.iqr) },
  ] : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Numbers</h3>
        <p className="mb-2 text-xs text-slate-500">Enter numbers separated by commas, semicolons, or new lines.</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="e.g. 4, 7, 2, 9…"
        />
        <p className="mt-2 text-xs text-slate-500">
          {numbers.length} number{numbers.length !== 1 ? "s" : ""} detected
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-950">Statistics</h3>
          <button
            onClick={handleCopyStats}
            disabled={!stats}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        {stats ? (
          <div className="space-y-2">
            {statRows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2 even:bg-slate-50">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="font-mono text-sm font-semibold text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter numbers to see statistics.</p>
        )}
      </section>
    </div>
  );
}
