import { useMemo, useState } from "react";

function detectDelimiter(csv: string): string {
  const first = csv.split("\n")[0] ?? "";
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  for (const c of first) if (c in counts) counts[c]++;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] ?? ",";
}

function parseCsv(input: string, delimiterAuto: boolean, manualDelim: string, firstRowHeaders: boolean, trimWs: boolean) {
  if (!input.trim()) return { json: "", error: "", rows: 0 };
  try {
    const delimiter = delimiterAuto ? detectDelimiter(input) : manualDelim;
    const lines = input.split(/\r?\n/).filter((l) => l.trim());
    const rows = lines.map((line) => {
      const cells: string[] = [];
      let cur = "", inQuote = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuote = !inQuote; continue; }
        if (!inQuote && line[i] === delimiter) { cells.push(trimWs ? cur.trim() : cur); cur = ""; continue; }
        cur += line[i];
      }
      cells.push(trimWs ? cur.trim() : cur);
      return cells;
    });

    if (rows.length === 0) return { json: "[]", error: "", rows: 0 };

    let result: object[];
    if (firstRowHeaders) {
      const headers = rows[0];
      result = rows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
        return obj;
      });
    } else {
      result = rows.map((row) => {
        const obj: Record<string, string> = {};
        row.forEach((v, i) => { obj[`col${i + 1}`] = v; });
        return obj;
      });
    }

    return { json: JSON.stringify(result, null, 2), error: "", rows: result.length };
  } catch (e) {
    return { json: "", error: e instanceof Error ? e.message : "Parse error", rows: 0 };
  }
}

export default function CsvToJsonApp() {
  const [input, setInput] = useState("name,age,city\nAlice,30,London\nBob,25,Paris");
  const [autoDelimiter, setAutoDelimiter] = useState(true);
  const [manualDelim, setManualDelim] = useState(",");
  const [firstRowHeaders, setFirstRowHeaders] = useState(true);
  const [trimWs, setTrimWs] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => parseCsv(input, autoDelimiter, manualDelim, firstRowHeaders, trimWs), [input, autoDelimiter, manualDelim, firstRowHeaders, trimWs]);

  function handleCopy() {
    if (!result.json) return;
    navigator.clipboard.writeText(result.json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleDownload() {
    if (!result.json) return;
    const blob = new Blob([result.json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "output.json";
    a.click();
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Options</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={autoDelimiter} onChange={(e) => setAutoDelimiter(e.target.checked)} />
            Auto-detect delimiter
          </label>
          {!autoDelimiter && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Delimiter</label>
              <input
                type="text"
                value={manualDelim}
                onChange={(e) => setManualDelim(e.target.value.slice(0, 1) || ",")}
                className="w-12 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-mono outline-none"
              />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={firstRowHeaders} onChange={(e) => setFirstRowHeaders(e.target.checked)} />
            First row as headers
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={trimWs} onChange={(e) => setTrimWs(e.target.checked)} />
            Trim whitespace
          </label>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">CSV input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">
              JSON output {result.rows > 0 && <span className="text-sm font-normal text-slate-500">({result.rows} rows)</span>}
            </h3>
            <div className="flex gap-2">
              {result.json && (
                <>
                  <button onClick={handleCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload} className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition">
                    Download .json
                  </button>
                </>
              )}
            </div>
          </div>
          {result.error ? (
            <p className="text-sm text-red-600">{result.error}</p>
          ) : (
            <textarea
              readOnly
              value={result.json}
              className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700 outline-none"
            />
          )}
        </section>
      </div>
    </div>
  );
}
