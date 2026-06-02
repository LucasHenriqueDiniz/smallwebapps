import { useMemo, useState } from "react";

function summarizeJson(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [`Top-level array length: ${value.length}`];
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).slice(0, 8).map((key) => `Key: ${key}`);
  }

  return [`Top-level type: ${typeof value}`];
}

export default function JsonFormatterApp() {
  const [input, setInput] = useState('{"tool":"Small Web Apps","status":"ready"}');
  const [indent, setIndent] = useState(2);
  const parseResult = useMemo(() => {
    try {
      return {
        parsed: JSON.parse(input) as unknown,
        error: ""
      };
    } catch (err) {
      return {
        parsed: null,
        error: err instanceof Error ? err.message : "Invalid JSON"
      };
    }
  }, [input]);

  const output = useMemo(() => {
    if (!parseResult.parsed) {
      return "";
    }

    return JSON.stringify(parseResult.parsed, null, indent);
  }, [parseResult.parsed, indent]);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">Input JSON</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label htmlFor="indent">Indent</label>
            <select
              id="indent"
              value={indent}
              onChange={(event) => setIndent(Number(event.target.value))}
              className="rounded-full border border-slate-300 px-3 py-1.5"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-72 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-orange-200 transition focus:ring-2"
          spellCheck={false}
        />
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">Validation</h3>
          <p className={`mt-3 text-sm ${parseResult.error ? "text-red-600" : "text-teal-700"}`}>
            {parseResult.error || "Valid JSON. The formatted output is ready below."}
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">Quick inspection</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {(parseResult.parsed ? summarizeJson(parseResult.parsed) : ["Waiting for valid JSON"]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white">
          <h3 className="text-lg font-semibold">Formatted output</h3>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-200">
            {output || "Fix the JSON input to see formatted output."}
          </pre>
        </div>
      </section>
    </div>
  );
}
