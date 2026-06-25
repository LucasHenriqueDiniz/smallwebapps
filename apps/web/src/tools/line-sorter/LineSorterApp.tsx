import { useState } from "react";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LineSorterApp() {
  const [input, setInput] = useState("banana\napple\ncherry\ndate\napricot");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function getLines() {
    return input.split("\n");
  }

  function applySort(sorted: string[]) {
    setOutput(sorted.join("\n"));
  }

  const lineCount = output ? output.split("\n").length : 0;

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Input lines</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="One line per entry…"
          spellCheck={false}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "A → Z", fn: () => applySort([...getLines()].sort((a, b) => a.localeCompare(b))) },
            { label: "Z → A", fn: () => applySort([...getLines()].sort((a, b) => b.localeCompare(a))) },
            { label: "Length ↑", fn: () => applySort([...getLines()].sort((a, b) => a.length - b.length)) },
            { label: "Length ↓", fn: () => applySort([...getLines()].sort((a, b) => b.length - a.length)) },
            { label: "Reverse", fn: () => applySort([...getLines()].reverse()) },
            { label: "Shuffle", fn: () => applySort(shuffleArray(getLines())) },
            { label: "Remove Duplicates", fn: () => applySort([...new Set(getLines())]) },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-950">
            Output {lineCount > 0 && <span className="ml-1 text-sm font-normal text-slate-500">({lineCount} lines)</span>}
          </h3>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          className="min-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none"
          placeholder="Sorted output will appear here…"
        />
      </section>
    </div>
  );
}
