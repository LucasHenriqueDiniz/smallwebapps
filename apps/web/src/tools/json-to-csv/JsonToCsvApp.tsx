import { useMemo, useState } from "react";

type Delimiter = "," | ";" | "\t";

function jsonToCsv(input: string, delimiter: Delimiter, includeHeaders: boolean): { csv: string; error: string; rows: number } {
  try {
    const data = JSON.parse(input);
    if (!Array.isArray(data)) return { csv: "", error: "Input must be a JSON array of objects.", rows: 0 };
    if (data.length === 0) return { csv: "", error: "Array is empty.", rows: 0 };

    const keys = Array.from(new Set(data.flatMap((row: unknown) => (row && typeof row === "object" ? Object.keys(row as object) : []))));
    const lines: string[] = [];
    if (includeHeaders) {
      lines.push(keys.map((k) => escapeCell(k, delimiter)).join(delimiter));
    }
    for (const row of data) {
      const r = row as Record<string, unknown>;
      lines.push(keys.map((k) => escapeCell(String(r[k] ?? ""), delimiter)).join(delimiter));
    }
    return { csv: lines.join("\n"), error: "", rows: data.length };
  } catch (e) {
    return { csv: "", error: e instanceof Error ? e.message : "Invalid JSON", rows: 0 };
  }
}

function escapeCell(val: string, delimiter: Delimiter): string {
  if (val.includes(delimiter) || val.includes('"') || val.includes("\n")) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

export default function JsonToCsvApp() {
  const [input, setInput] = useState('[{"name":"Alice","age":30,"city":"London"},{"name":"Bob","age":25,"city":"Paris"}]');
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => jsonToCsv(input, delimiter, includeHeaders), [input, delimiter, includeHeaders]);

  function handleCopy() {
    if (!result.csv) return;
    navigator.clipboard.writeText(result.csv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleDownload() {
    if (!result.csv) return;
    const blob = new Blob([result.csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "output.csv";
    a.click();
  }

  const delimiterOptions: { label: string; value: Delimiter }[] = [
    { label: "Comma (,)", value: "," },
    { label: "Semicolon (;)", value: ";" },
    { label: "Tab", value: "\t" },
  ];

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Options</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as Delimiter)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
            >
              {delimiterOptions.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 pb-1 text-sm text-slate-700 self-end">
            <input type="checkbox" checked={includeHeaders} onChange={(e) => setIncludeHeaders(e.target.checked)} />
            Include headers
          </label>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">JSON input</h3>
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
              CSV output {result.rows > 0 && <span className="text-sm font-normal text-slate-500">({result.rows} rows)</span>}
            </h3>
            <div className="flex gap-2">
              {result.csv && (
                <>
                  <button onClick={handleCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload} className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition">
                    Download .csv
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
              value={result.csv}
              className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700 outline-none"
            />
          )}
        </section>
      </div>
    </div>
  );
}
