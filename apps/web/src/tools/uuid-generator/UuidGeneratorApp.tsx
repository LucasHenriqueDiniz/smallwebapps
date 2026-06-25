import { useState } from "react";

export default function UuidGeneratorApp() {
  const [count, setCount] = useState<1 | 5 | 10 | 50>(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  function generate() {
    const result = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids(result);
    setCopiedIdx(null);
  }

  function copyOne(i: number) {
    navigator.clipboard.writeText(uuids[i]).then(() => {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n")).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 1800);
    });
  }

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Generate UUIDs (v4)</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {([1, 5, 10, 50] as const).map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${n === count ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {n} UUID{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        <button
          onClick={generate}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Generate
        </button>
      </section>

      {uuids.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">{uuids.length} UUID{uuids.length > 1 ? "s" : ""}</h3>
            {uuids.length > 1 && (
              <button onClick={copyAll} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                {allCopied ? "✓ All copied" : "Copy all"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {uuids.map((uuid, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <span className="flex-1 font-mono text-sm text-slate-800 select-all">{uuid}</span>
                <button
                  onClick={() => copyOne(i)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
                >
                  {copiedIdx === i ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
