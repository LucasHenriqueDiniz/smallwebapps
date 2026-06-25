import { useState } from "react";

const DEFAULT_JSON = `{
  "catalog": {
    "book": [
      { "id": "bk101", "title": "XML Guide", "price": 44.95 },
      { "id": "bk102", "title": "JSON Patterns", "price": 29.99 }
    ]
  }
}`;

function jsonToXml(value: unknown, tagName: string, indent = 0, indentStr = "  "): string {
  const pad = indentStr.repeat(indent);
  const innerPad = indentStr.repeat(indent + 1);

  if (value === null || value === undefined) {
    return `${pad}<${tagName}/>`;
  }

  if (Array.isArray(value)) {
    return value.map(item => jsonToXml(item, tagName, indent, indentStr)).join("\n");
  }

  if (typeof value === "object") {
    const children = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => jsonToXml(v, k, indent + 1, indentStr))
      .join("\n");
    return `${pad}<${tagName}>\n${children}\n${pad}</${tagName}>`;
  }

  return `${pad}<${tagName}>${String(value)}</${tagName}>`;
}

export default function JsonToXmlApp() {
  const [json, setJson] = useState(DEFAULT_JSON);
  const [rootName, setRootName] = useState("root");
  const [indentSize, setIndentSize] = useState(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function convert() {
    if (!json.trim()) { setOutput(""); setError(""); return; }
    try {
      const obj = JSON.parse(json) as unknown;
      const indentStr = " ".repeat(indentSize);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(obj, rootName, 0, indentStr)}`;
      setOutput(xml);
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

  function download() {
    if (!output) return;
    const blob = new Blob([output], { type: "application/xml" });
    const a = document.createElement("a");
    a.download = "output.xml";
    a.href = URL.createObjectURL(blob);
    a.click();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Root element</label>
          <input type="text" value={rootName} onChange={(e) => setRootName(e.target.value)} className="w-32 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Indent size</label>
          <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
        <button onClick={convert} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          Convert
        </button>
        {output && (
          <>
            <button onClick={copy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              {copied ? "✓ Copied" : "Copy XML"}
            </button>
            <button onClick={download} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              Download .xml
            </button>
          </>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">JSON Input</h3>
          <textarea value={json} onChange={(e) => setJson(e.target.value)} className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" spellCheck={false} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">XML Output</h3>
          <textarea readOnly value={output} className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none" placeholder="XML output appears here…" />
        </section>
      </div>
    </div>
  );
}
