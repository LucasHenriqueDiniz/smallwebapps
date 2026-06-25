import { useMemo, useState } from "react";

export default function UrlEncoderApp() {
  const [tab, setTab] = useState<"encode" | "decode">("encode");
  const [mode, setMode] = useState<"component" | "full">("component");
  const [input, setInput] = useState("https://example.com/search?q=hello world&lang=en");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    try {
      if (tab === "encode") {
        return mode === "component" ? encodeURIComponent(input) : encodeURI(input);
      } else {
        return mode === "component" ? decodeURIComponent(input) : decodeURI(input);
      }
    } catch {
      return "⚠ Invalid input for decoding";
    }
  }, [tab, mode, input]);

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(["encode", "decode"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition ${t === tab ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(["component", "full"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition ${m === mode ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
            >
              {m === "component" ? "Component" : "Full URL"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {mode === "component"
          ? "encodeURIComponent — encodes all special chars including : / ? # & ="
          : "encodeURI — encodes special chars but preserves URL structure chars"}
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Output</h3>
            {output && !output.startsWith("⚠") && (
              <button onClick={handleCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            className="min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700 outline-none"
          />
        </section>
      </div>
    </div>
  );
}
