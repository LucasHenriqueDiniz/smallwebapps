import { useState } from "react";

const SAMPLE_NESTED = `{
  "user": {
    "name": "Alice",
    "address": {
      "city": "Paris",
      "zip": "75001"
    },
    "tags": ["developer", "designer"]
  },
  "meta": {
    "version": 2,
    "active": true
  }
}`;

const SAMPLE_FLAT = `{
  "user.name": "Alice",
  "user.address.city": "Paris",
  "user.address.zip": "75001",
  "user.tags.0": "developer",
  "user.tags.1": "designer",
  "meta.version": 2,
  "meta.active": true
}`;

function flatten(obj: unknown, prefix = "", sep = "."): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  function recurse(val: unknown, key: string) {
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        recurse(v, key ? `${key}${sep}${k}` : k);
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => recurse(item, key ? `${key}${sep}${i}` : String(i)));
    } else {
      result[key] = val;
    }
  }
  recurse(obj, prefix);
  return result;
}

function unflatten(obj: Record<string, unknown>, sep = "."): unknown {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split(sep);
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) current[part] = {};
      current = current[part] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

export default function JsonFlattenApp() {
  const [mode, setMode] = useState<"flatten" | "unflatten">("flatten");
  const [input, setInput] = useState(SAMPLE_NESTED);
  const [sep, setSep] = useState(".");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function process() {
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      const obj = JSON.parse(input) as unknown;
      let result: unknown;
      if (mode === "flatten") {
        result = flatten(obj, "", sep);
      } else {
        result = unflatten(obj as Record<string, unknown>, sep);
      }
      setOutput(JSON.stringify(result, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {(["flatten", "unflatten"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setInput(m === "flatten" ? SAMPLE_NESTED : SAMPLE_FLAT); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition capitalize ${mode === m ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Separator</label>
          <input type="text" value={sep} onChange={(e) => setSep(e.target.value || ".")} maxLength={3} className="w-14 rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <button onClick={process} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          {mode === "flatten" ? "Flatten" : "Unflatten"}
        </button>
        {output && (
          <button onClick={copy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copied ? "✓ Copied" : "Copy Output"}
          </button>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Input JSON</h3>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" spellCheck={false} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Output</h3>
          <textarea readOnly value={output} className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none" placeholder="Output appears here…" />
        </section>
      </div>
    </div>
  );
}
