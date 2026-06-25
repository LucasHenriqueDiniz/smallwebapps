import { useState, useEffect } from "react";

const DEFAULT_YAML = `name: Small Web Apps
version: "1.0"
tools:
  - name: YAML to JSON
    category: Developer Tools
    free: true
settings:
  darkMode: true
  language: en
`;

const DEFAULT_JSON = `{
  "name": "Small Web Apps",
  "version": "1.0",
  "tools": [
    { "name": "YAML to JSON", "category": "Developer Tools", "free": true }
  ],
  "settings": {
    "darkMode": true,
    "language": "en"
  }
}`;

export default function YamlToJsonApp() {
  const [direction, setDirection] = useState<"yaml2json" | "json2yaml">("yaml2json");
  const [left, setLeft] = useState(DEFAULT_YAML);
  const [right, setRight] = useState(DEFAULT_JSON);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    convert(left);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, direction]);

  async function convert(input: string) {
    if (!input.trim()) { setRight(""); setError(""); return; }
    try {
      const yaml = await import("js-yaml");
      if (direction === "yaml2json") {
        const obj = yaml.load(input);
        setRight(JSON.stringify(obj, null, 2));
        setError("");
      } else {
        const obj = JSON.parse(input);
        setRight(yaml.dump(obj));
        setError("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse error");
      setRight("");
    }
  }

  function swap() {
    setDirection(d => d === "yaml2json" ? "json2yaml" : "yaml2json");
    setLeft(right);
    setRight(left);
    setError("");
  }

  function copyOutput() {
    if (!right) return;
    navigator.clipboard.writeText(right).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const leftLabel = direction === "yaml2json" ? "YAML" : "JSON";
  const rightLabel = direction === "yaml2json" ? "JSON" : "YAML";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">{leftLabel} → {rightLabel}</span>
        <button
          onClick={swap}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          ⇄ Swap
        </button>
        {right && (
          <button onClick={copyOutput} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition ml-auto">
            {copied ? "✓ Copied" : "Copy Output"}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">{leftLabel} Input</h3>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
            placeholder={`Paste ${leftLabel} here…`}
          />
          {error && <p className="mt-2 text-xs font-medium text-red-600">✗ {error}</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">{rightLabel} Output</h3>
          <textarea
            readOnly
            value={right}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none"
            placeholder="Output appears here…"
          />
        </section>
      </div>
    </div>
  );
}
