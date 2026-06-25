import { useState } from "react";

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Daily at noon", value: "0 12 * * *" },
  { label: "Weekly (Monday)", value: "0 0 * * 1" },
  { label: "Monthly (1st)", value: "0 0 1 * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Weekdays at 9am", value: "0 9 * * 1-5" },
];

const REFERENCE = [
  { char: "*", meaning: "Any value" },
  { char: ",", meaning: "List separator (e.g. 1,3,5)" },
  { char: "-", meaning: "Range (e.g. 1-5)" },
  { char: "/", meaning: "Step (e.g. */5)" },
  { char: "?", meaning: "No specific value (day fields)" },
  { char: "L", meaning: "Last (e.g. last day of month)" },
  { char: "W", meaning: "Nearest weekday" },
];

export default function CronParserApp() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function parse(value: string) {
    setExpr(value);
    if (!value.trim()) { setDescription(""); setError(""); return; }
    try {
      const cronstrue = (await import("cronstrue")).default;
      const desc = cronstrue.toString(value, { use24HourTimeFormat: true });
      setDescription(desc);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid cron expression");
      setDescription("");
    }
  }

  const fields = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"];
  const parts = expr.trim().split(/\s+/);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Cron Expression</h3>
        <input
          type="text"
          value={expr}
          onChange={(e) => parse(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-lg text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="* * * * *"
          spellCheck={false}
        />
        {description && (
          <p className="mt-3 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
            ✓ {description}
          </p>
        )}
        {error && (
          <p className="mt-3 text-xs font-medium text-red-600">✗ {error}</p>
        )}

        {parts.length >= 5 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {fields.map((field, i) => (
              <div key={field} className="flex flex-col items-center gap-1">
                <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-base font-semibold text-slate-800">
                  {parts[i] ?? "?"}
                </span>
                <span className="text-xs text-slate-500">{field}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Common Examples</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => parse(value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                expr === value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
              <span className="ml-2 font-mono text-slate-400">{value}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Special Characters</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-100">
                <th className="pb-2 pr-6">Character</th>
                <th className="pb-2">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REFERENCE.map(({ char, meaning }) => (
                <tr key={char}>
                  <td className="py-2 pr-6 font-mono font-semibold text-slate-800">{char}</td>
                  <td className="py-2 text-slate-600">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
