import { useMemo, useState } from "react";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toSnake(str: string) {
  return toSlug(str).replace(/-/g, "_");
}

function toDot(str: string) {
  return toSlug(str).replace(/-/g, ".");
}

export default function SlugGeneratorApp() {
  const [input, setInput] = useState("Hello World! This is a Test String.");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const variants = useMemo(() => [
    { label: "URL Slug (kebab-case)", value: toSlug(input) },
    { label: "snake_case", value: toSnake(input) },
    { label: "dot.case", value: toDot(input) },
  ], [input]);

  function handleCopy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Input text</h3>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="Enter a title or phrase…"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Converted variants</h3>
        <div className="space-y-3">
          {variants.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span className="w-44 shrink-0 text-xs font-semibold text-slate-500">{label}</span>
              <span className="flex-1 break-all font-mono text-sm text-slate-800">{value || <span className="text-slate-400">—</span>}</span>
              <button
                onClick={() => handleCopy(label, value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
              >
                {copiedKey === label ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
