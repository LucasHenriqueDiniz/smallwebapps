import { useState } from "react";

const DEFAULT_HTML = `<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Hello World</h1><p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></body></html>`;

export default function HtmlFormatterApp() {
  const [input, setInput] = useState(DEFAULT_HTML);
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [wrapLen, setWrapLen] = useState(120);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ inLines: number; outLines: number } | null>(null);

  async function handle(mode: "format" | "minify") {
    if (!input.trim()) return;
    try {
      const { html_beautify } = await import("js-beautify");
      let result: string;
      if (mode === "format") {
        result = html_beautify(input, {
          indent_size: indent,
          wrap_line_length: wrapLen === 0 ? 0 : wrapLen,
          preserve_newlines: false,
        });
      } else {
        result = input.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
      }
      setOutput(result);
      setStats({
        inLines: input.split("\n").length,
        outLines: result.split("\n").length,
      });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Indent</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Wrap at</label>
          <select
            value={wrapLen}
            onChange={(e) => setWrapLen(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
          >
            <option value={80}>80 chars</option>
            <option value={120}>120 chars</option>
            <option value={0}>None</option>
          </select>
        </div>
        <button onClick={() => handle("format")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          Format
        </button>
        <button onClick={() => handle("minify")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
          Minify
        </button>
        {output && (
          <button onClick={copyOutput} className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copied ? "✓ Copied" : "Copy Output"}
          </button>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}
      {stats && (
        <p className="text-xs text-slate-500">
          Input: {stats.inLines} line{stats.inLines !== 1 ? "s" : ""} → Output: {stats.outLines} line{stats.outLines !== 1 ? "s" : ""}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">HTML Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
            placeholder="Paste HTML here…"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Output</h3>
          <textarea
            readOnly
            value={output}
            className="min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none"
            placeholder="Formatted or minified HTML appears here…"
          />
        </section>
      </div>
    </div>
  );
}
