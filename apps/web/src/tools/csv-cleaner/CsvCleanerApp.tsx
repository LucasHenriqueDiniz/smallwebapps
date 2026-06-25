import { useMemo, useState } from "react";

function parseRows(raw: string): string[][] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.split(","))
    .filter((cells) => cells.some((c) => c.trim().length > 0));
}

export default function CsvCleanerApp() {
  const [input, setInput] = useState(
    "name, city, score\n Alice , São Paulo , 42 \n Bob, Recife, 37\n,,"
  );
  const [copied, setCopied] = useState(false);

  const rows    = useMemo(() => parseRows(input), [input]);
  const cleaned = useMemo(
    () => rows.map((cells) => cells.map((c) => c.trim()).join(",")).join("\n"),
    [rows]
  );
  const colCount = useMemo(() => Math.max(...rows.map((r) => r.length), 0), [rows]);

  function copyOutput() {
    if (!cleaned) return;
    navigator.clipboard.writeText(cleaned).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function downloadOutput() {
    const blob = new Blob([cleaned], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "cleaned.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
      {/* Input */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Paste CSV data</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          spellCheck={false}
          placeholder="Paste your CSV here…"
          aria-label="CSV input"
        />
      </section>

      {/* Output */}
      <section className="flex flex-col gap-4">
        {/* Stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Quick stats</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-900">Rows kept</dt>
              <dd className="text-slate-600">{rows.length}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Columns detected</dt>
              <dd className="text-slate-600">{colCount}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-semibold text-slate-900">Cleanup applied</dt>
              <dd className="text-slate-600">Trimmed whitespace · Removed blank rows</dd>
            </div>
          </dl>
        </div>

        {/* Cleaned output */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-base font-semibold">Cleaned output</h3>
            {cleaned && (
              <div className="flex gap-2">
                <button
                  onClick={copyOutput}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button
                  onClick={downloadOutput}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  ↓ Download
                </button>
              </div>
            )}
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-200 leading-relaxed">
            {cleaned || "Add CSV rows above to generate cleaned output here."}
          </pre>
        </div>
      </section>
    </div>
  );
}
