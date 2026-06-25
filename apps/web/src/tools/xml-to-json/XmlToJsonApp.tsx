import { useState } from "react";

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Smith, Bob</author>
    <title>XML Developer Guide</title>
    <price>44.95</price>
  </book>
  <book id="bk102">
    <author>Doe, Jane</author>
    <title>JSON Patterns</title>
    <price>29.99</price>
  </book>
</catalog>`;

export default function XmlToJsonApp() {
  const [xml, setXml] = useState(DEFAULT_XML);
  const [json, setJson] = useState("");
  const [error, setError] = useState("");
  const [ignoreAttrs, setIgnoreAttrs] = useState(false);
  const [parseNums, setParseNums] = useState(true);
  const [copied, setCopied] = useState(false);

  async function convert() {
    if (!xml.trim()) { setJson(""); setError(""); return; }
    try {
      const { XMLParser } = await import("fast-xml-parser");
      const parser = new XMLParser({
        ignoreAttributes: ignoreAttrs,
        attributeNamePrefix: "@_",
        parseAttributeValue: parseNums,
        parseTagValue: parseNums,
      });
      const result = parser.parse(xml);
      setJson(JSON.stringify(result, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse error");
      setJson("");
    }
  }

  function copyJson() {
    if (!json) return;
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function downloadJson() {
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "output.json";
    a.click();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={ignoreAttrs} onChange={(e) => setIgnoreAttrs(e.target.checked)} className="rounded" />
          Ignore attributes
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={parseNums} onChange={(e) => setParseNums(e.target.checked)} className="rounded" />
          Parse numbers
        </label>
        <button onClick={convert} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          Convert
        </button>
        {json && (
          <>
            <button onClick={copyJson} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              {copied ? "✓ Copied" : "Copy JSON"}
            </button>
            <button onClick={downloadJson} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              Download .json
            </button>
          </>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">XML Input</h3>
          <textarea
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
            placeholder="Paste XML here…"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">JSON Output</h3>
          <textarea
            readOnly
            value={json}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none"
            placeholder="JSON output appears here…"
          />
        </section>
      </div>
    </div>
  );
}
