import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

function formatCss(css: string): string {
  // Remove existing formatting
  let s = css.replace(/\s*\{\s*/g, " {\n  ").replace(/\s*;\s*/g, ";\n  ")
    .replace(/\s*\}\s*/g, "\n}\n").replace(/\n  \n/g, "\n")
    .replace(/  \n\}/g, "\n}").replace(/\n{3,}/g, "\n\n").trim();
  // Fix selector spacing
  s = s.replace(/([^\n{};])\n  (?=[^{])/g, "$1\n");
  return s;
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/;\}/g, "}")
    .trim();
}

export default function CssFormatterApp() {
  const [input, setInput] = useState(`body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}`);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return mode === "format" ? formatCss(input) : minifyCss(input);
  }, [input, mode]);

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">Input CSS</h3>
          <div className="flex gap-2">
            {(["format", "minify"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition capitalize ${
                  mode === m ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-72 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          spellCheck={false}
          placeholder="Paste your CSS here…"
        />
      </section>

      <section className="flex flex-col">
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">{mode === "format" ? "Formatted" : "Minified"} output</h3>
            {output && (
              <button
                onClick={copy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          {output && mode === "minify" && (
            <p className="mb-2 text-xs text-slate-400">
              {input.length} → {output.length} chars · saved {Math.round((1 - output.length / input.length) * 100)}%
            </p>
          )}
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-200 leading-relaxed">
            {output || "Paste CSS in the input panel."}
          </pre>
        </div>
      </section>
    </div>
  );
}
