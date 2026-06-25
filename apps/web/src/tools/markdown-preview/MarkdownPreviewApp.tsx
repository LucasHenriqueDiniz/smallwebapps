import { useState, useEffect, useRef } from "react";

const DEFAULT_MD = `# Hello, Markdown!

Write your **Markdown** here and see a *live preview* on the right.

## Features
- Bold, Italic, Code
- Links and images
- Code blocks

\`\`\`js
console.log("Hello, World!");
\`\`\`

> Blockquotes work too.

[Visit Small Web Apps](https://smallwebapps.com)
`;

function insertAtCursor(
  el: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.substring(start, end) || placeholder;
  const newVal =
    el.value.substring(0, start) + before + selected + after + el.value.substring(end);
  return { newVal, cursor: start + before.length + selected.length + after.length };
}

export default function MarkdownPreviewApp() {
  const [md, setMd] = useState(DEFAULT_MD);
  const [html, setHtml] = useState("");
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("marked").then(({ marked }) => {
      const raw = marked(md) as string;
      const safe = raw.replace(/<script[\s\S]*?<\/script>/gi, "");
      if (!cancelled) setHtml(safe);
    });
    return () => { cancelled = true; };
  }, [md]);

  function wrap(before: string, after: string, placeholder: string) {
    const el = taRef.current;
    if (!el) return;
    const { newVal, cursor } = insertAtCursor(el, before, after, placeholder);
    setMd(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    }, 0);
  }

  function copyMd() {
    navigator.clipboard.writeText(md).then(() => {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 1800);
    });
  }

  function copyHtml() {
    navigator.clipboard.writeText(html).then(() => {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Insert:</span>
        {[
          { label: "Bold", b: "**", a: "**", ph: "bold text" },
          { label: "Italic", b: "_", a: "_", ph: "italic text" },
          { label: "Code", b: "`", a: "`", ph: "code" },
          { label: "Link", b: "[", a: "](url)", ph: "link text" },
        ].map(({ label, b, a, ph }) => (
          <button
            key={label}
            onClick={() => wrap(b, a, ph)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={copyMd} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copiedMd ? "✓ Copied MD" : "Copy Markdown"}
          </button>
          <button onClick={copyHtml} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copiedHtml ? "✓ Copied HTML" : "Copy HTML"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Input */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Markdown</h3>
          <textarea
            ref={taRef}
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="min-h-96 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
            placeholder="Write Markdown here…"
          />
        </section>

        {/* Preview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Preview</h3>
          <div
            className="prose prose-slate max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      </div>
    </div>
  );
}
