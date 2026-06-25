import { useMemo, useState } from "react";

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toSentenceCase(str: string) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}
function toCamelCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}
function toPascalCase(str: string) {
  const c = toCamelCase(str);
  return c.charAt(0).toUpperCase() + c.slice(1);
}
function toSnakeCase(str: string) {
  return str
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}
function toKebabCase(str: string) {
  return str
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

export default function CaseConverterApp() {
  const [input, setInput] = useState("The quick brown fox jumps over the lazy dog");
  const [copiedCase, setCopiedCase] = useState<string | null>(null);

  const cases = useMemo(() => [
    { label: "UPPERCASE", value: input.toUpperCase() },
    { label: "lowercase", value: input.toLowerCase() },
    { label: "Title Case", value: toTitleCase(input) },
    { label: "Sentence case", value: toSentenceCase(input) },
    { label: "camelCase", value: toCamelCase(input) },
    { label: "PascalCase", value: toPascalCase(input) },
    { label: "snake_case", value: toSnakeCase(input) },
    { label: "kebab-case", value: toKebabCase(input) },
  ], [input]);

  function handleCopy(label: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedCase(label);
      setTimeout(() => setCopiedCase(null), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Input text</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="Type or paste your text here…"
          spellCheck={false}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Converted cases</h3>
        <div className="space-y-3">
          {cases.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span className="w-28 shrink-0 text-xs font-semibold text-slate-500">{label}</span>
              <span className="flex-1 break-all text-sm text-slate-800 font-mono">{value || <span className="text-slate-400">—</span>}</span>
              <button
                onClick={() => handleCopy(label, value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
              >
                {copiedCase === label ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
