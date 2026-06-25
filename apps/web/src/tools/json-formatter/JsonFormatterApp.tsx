import { useMemo, useState } from "react";

function summarizeJson(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [`Top-level type: Array`, `Length: ${value.length} items`];
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    return [
      `Top-level type: Object`,
      `Keys (${keys.length}): ${keys.slice(0, 6).join(", ")}${keys.length > 6 ? "…" : ""}`,
    ];
  }
  return [`Top-level type: ${typeof value}`, `Value: ${String(value)}`];
}

export default function JsonFormatterApp() {
  const [input, setInput]   = useState('{"tool":"Small Web Apps","status":"ready"}');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const parseResult = useMemo(() => {
    try {
      return { parsed: JSON.parse(input) as unknown, error: "" };
    } catch (err) {
      return { parsed: null, error: err instanceof Error ? err.message : "Invalid JSON" };
    }
  }, [input]);

  const output = useMemo(() => {
    if (!parseResult.parsed) return "";
    return JSON.stringify(parseResult.parsed, null, indent);
  }, [parseResult.parsed, indent]);

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
      {/* Input */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">Input JSON</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label htmlFor="indent-select" className="text-xs font-medium text-slate-500">Indent</label>
            <select
              id="indent-select"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={0}>Minified</option>
            </select>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          spellCheck={false}
          placeholder='Paste your JSON here…'
          aria-label="JSON input"
        />
      </section>

      {/* Output */}
      <section className="flex flex-col gap-4">
        {/* Validation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Validation</h3>
          <p className={`mt-2 text-sm font-medium ${parseResult.error ? "text-red-600" : "text-emerald-600"}`}>
            {parseResult.error
              ? `✗ ${parseResult.error}`
              : "✓ Valid JSON"}
          </p>
        </div>

        {/* Inspection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Quick inspection</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            {(parseResult.parsed
              ? summarizeJson(parseResult.parsed)
              : ["Waiting for valid JSON input"]
            ).map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="mt-0.5 text-slate-300">›</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Formatted output */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Formatted output</h3>
            {output && (
              <button
                onClick={copyOutput}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-200 leading-relaxed">
            {output || "Fix the JSON input to see formatted output here."}
          </pre>
        </div>
      </section>
    </div>
  );
}
