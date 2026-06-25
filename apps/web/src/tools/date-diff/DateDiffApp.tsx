import { useMemo, useState } from "react";

function calcDiff(start: Date, end: Date) {
  let d1 = start <= end ? start : end;
  let d2 = start <= end ? end : start;
  const isPast = start <= end;

  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    months--;
    days += new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMs = Math.abs(d2.getTime() - d1.getTime());
  const totalDays = Math.floor(totalMs / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMinutes = Math.floor(totalMs / 60000);

  return { years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, isPast };
}

export default function DateDiffApp() {
  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState(() => new Date().toISOString().split("T")[0]);

  const diff = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    return calcDiff(s, e);
  }, [start, end]);

  function handleSwap() {
    setStart(end);
    setEnd(start);
  }

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Select dates</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Start date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            />
          </div>
          <button
            onClick={handleSwap}
            className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition mb-0.5"
            title="Swap dates"
          >
            ⇄
          </button>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">End date</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            />
          </div>
        </div>
      </section>

      {diff && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Difference</h3>
          <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-center">
            <span className="text-xl font-bold text-blue-700">
              {diff.years} years, {diff.months} months, {diff.days} days
            </span>
            <div className="mt-1 text-xs text-blue-500">{diff.isPast ? "In the past" : "In the future"}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total days", value: diff.totalDays.toLocaleString() },
              { label: "Total weeks", value: diff.totalWeeks.toLocaleString() },
              { label: "Total hours", value: diff.totalHours.toLocaleString() },
              { label: "Total minutes", value: diff.totalMinutes.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-0.5 text-sm font-bold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
