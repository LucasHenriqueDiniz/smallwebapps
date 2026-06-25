import { useState } from "react";

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?><root><person><name>Alice</name><age>30</age></person><person><name>Bob</name><age>25</age></person></root>`;

function formatXml(xml: string, indent = 2): string {
  const indentStr = " ".repeat(indent);
  let result = "";
  let level = 0;
  let i = 0;
  const tokens: string[] = [];

  // Tokenize
  while (i < xml.length) {
    if (xml[i] === "<") {
      const end = xml.indexOf(">", i);
      if (end === -1) break;
      tokens.push(xml.substring(i, end + 1));
      i = end + 1;
    } else {
      const end = xml.indexOf("<", i);
      const text = end === -1 ? xml.substring(i) : xml.substring(i, end);
      if (text.trim()) tokens.push(text.trim());
      i = end === -1 ? xml.length : end;
    }
  }

  for (const token of tokens) {
    if (token.startsWith("</")) {
      level--;
      result += indentStr.repeat(level) + token + "\n";
    } else if (token.startsWith("<?") || token.startsWith("<!")) {
      result += indentStr.repeat(level) + token + "\n";
    } else if (token.endsWith("/>")) {
      result += indentStr.repeat(level) + token + "\n";
    } else if (token.startsWith("<")) {
      result += indentStr.repeat(level) + token + "\n";
      level++;
    } else {
      result += indentStr.repeat(level) + token + "\n";
    }
  }
  return result.trimEnd();
}

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, "><").trim();
}

function validateXml(xml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) return err.textContent || "Parse error";
    return "";
  } catch {
    return "Parse error";
  }
}

export default function XmlFormatterApp() {
  const [input, setInput] = useState(DEFAULT_XML);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  function handle(mode: "format" | "minify") {
    const errMsg = validateXml(input);
    if (errMsg) {
      setError(errMsg);
      setValid(false);
      setOutput("");
      return;
    }
    setValid(true);
    setError("");
    if (mode === "format") {
      setOutput(formatXml(input));
    } else {
      setOutput(minifyXml(input));
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => handle("format")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          Format XML
        </button>
        <button onClick={() => handle("minify")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
          Minify
        </button>
        {valid !== null && (
          <span className={`text-xs font-medium ${valid ? "text-emerald-600" : "text-red-600"}`}>
            {valid ? "✓ Valid XML" : `✗ ${error}`}
          </span>
        )}
        {output && (
          <button onClick={copyOutput} className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copied ? "✓ Copied" : "Copy Output"}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">XML Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
            placeholder="Paste XML here…"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Output</h3>
          <textarea
            readOnly
            value={output}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none"
            placeholder="Formatted or minified XML appears here…"
          />
        </section>
      </div>
    </div>
  );
}
