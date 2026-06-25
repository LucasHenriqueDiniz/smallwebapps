import { useMemo, useState } from "react";

export default function DuplicateRemoverApp() {
  const [input, setInput] = useState("apple\nbanana\napple\ncherry\nBANANA\ncherry\ndate");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const line of lines) {
      const processed = trimWhitespace ? line.trim() : line;
      const key = caseSensitive ? processed : processed.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(processed);
      }
    }

    return {
      output: unique.join("\n"),
      removed: lines.length - unique.length,
      unique: unique.length,
    };
  }, [input, caseSensitive, trimWhitespace]);

  function handleCopy() {
    navigator.clipboard.writeText(result.output).then(() => {
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
          placeholder="One item per line…"
          spellCheck={false}
        />
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded"
            />
            Case-sensitive
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="rounded"
            />
            Trim whitespace
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-950">Deduplicated output</h3>
          <button
            onClick={handleCopy}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div className="mb-3 flex gap-4 text-sm">
          <span className="text-red-600 font-medium">{result.removed} removed</span>
          <span className="text-emerald-600 font-medium">{result.unique} unique remain</span>
        </div>
        <textarea
          readOnly
          value={result.output}
          className="min-h-56 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none"
          placeholder="Output appears here…"
        />
      </section>
    </div>
  );
}
