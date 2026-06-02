import { useMemo, useState } from "react";

function parseRows(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.split(","))
    .filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

export default function CsvCleanerApp() {
  const [input, setInput] = useState("name, city, score\n Alice , Sao Paulo , 42 \n Bob, Recife, 37\n,,");

  const rows = useMemo(() => parseRows(input), [input]);
  const cleaned = useMemo(
    () =>
      rows
        .map((cells) => cells.map((cell) => cell.trim()).join(","))
        .join("\n"),
    [rows]
  );

  const columnCount = useMemo(() => Math.max(...rows.map((cells) => cells.length), 0), [rows]);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-950">Paste CSV data</h3>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="mt-4 min-h-72 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-orange-200 transition focus:ring-2"
          spellCheck={false}
        />
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">Quick stats</h3>
          <dl className="mt-3 grid gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-900">Rows kept</dt>
              <dd>{rows.length}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Estimated columns</dt>
              <dd>{columnCount}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Cleanup applied</dt>
              <dd>Trimmed whitespace and removed fully empty rows</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white">
          <h3 className="text-lg font-semibold">Cleaned output</h3>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-200">
            {cleaned || "Add CSV rows to generate cleaned output."}
          </pre>
        </div>
      </section>
    </div>
  );
}

