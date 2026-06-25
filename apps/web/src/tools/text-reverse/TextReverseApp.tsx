import { useMemo, useState } from "react";

export default function TextReverseApp() {
  const [input, setInput] = useState("Hello World\nThis is a test");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const outputs = useMemo(() => ({
    chars: input.split("").reverse().join(""),
    words: input.split("\n").map((line) => line.split(" ").reverse().join(" ")).join("\n"),
    lines: input.split("\n").reverse().join("\n"),
  }), [input]);

  function handleCopy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  const panels = [
    { key: "chars", label: "Reverse Characters", value: outputs.chars },
    { key: "words", label: "Reverse Words", value: outputs.words },
    { key: "lines", label: "Reverse Lines", value: outputs.lines },
  ];

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Input text</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="Type or paste text here…"
          spellCheck={false}
        />
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {panels.map(({ key, label, value }) => (
          <section key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
              <button
                onClick={() => handleCopy(key, value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {copiedKey === key ? "✓" : "Copy"}
              </button>
            </div>
            <div className="break-all font-mono text-sm text-slate-700 whitespace-pre-wrap">
              {value || <span className="text-slate-400">—</span>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
