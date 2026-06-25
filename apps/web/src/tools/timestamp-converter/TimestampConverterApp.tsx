import { useState } from "react";

function formatDate(d: Date) {
  return d.toUTCString();
}

function toISO(d: Date) {
  return d.toISOString();
}

function toLocal(d: Date) {
  return d.toLocaleString();
}

export default function TimestampConverterApp() {
  const [tsInput, setTsInput] = useState("1717200000");
  const [dateInput, setDateInput] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  });

  // Timestamp → Date
  const tsResult = (() => {
    const raw = tsInput.trim();
    if (!raw) return null;
    const n = Number(raw);
    if (isNaN(n)) return { error: "Invalid timestamp" };
    // Auto-detect ms vs seconds
    const ms = raw.length >= 13 ? n : n * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return { error: "Out of range" };
    return { utc: formatDate(d), local: toLocal(d), iso: toISO(d), error: "" };
  })();

  // Date → Timestamp
  const dateResult = (() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return { seconds: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  })();

  function setNow() {
    const d = new Date();
    d.setSeconds(0, 0);
    setDateInput(d.toISOString().slice(0, 16));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Timestamp → Date */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Timestamp → Date</h3>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Unix timestamp (seconds or milliseconds)</label>
        <input
          type="text"
          value={tsInput}
          onChange={(e) => setTsInput(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="e.g. 1717200000"
        />
        {tsResult && (
          tsResult.error ? (
            <p className="mt-3 text-sm text-red-600">{tsResult.error}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {[
                { label: "UTC", value: tsResult.utc },
                { label: "Local", value: tsResult.local },
                { label: "ISO 8601", value: tsResult.iso },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div className="text-xs font-medium text-slate-500">{label}</div>
                  <div className="mt-0.5 font-mono text-sm text-slate-800 break-all">{value}</div>
                </div>
              ))}
            </div>
          )
        )}
      </section>

      {/* Date → Timestamp */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Date → Timestamp</h3>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Date and time</label>
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          />
          <button
            onClick={setNow}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Now
          </button>
        </div>
        {dateResult && (
          <div className="mt-4 space-y-3">
            {[
              { label: "Unix seconds", value: dateResult.seconds.toString() },
              { label: "Unix milliseconds", value: dateResult.ms.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="text-xs font-medium text-slate-500">{label}</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
