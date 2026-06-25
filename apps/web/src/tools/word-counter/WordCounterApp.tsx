import { useMemo, useState } from "react";

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}

export default function WordCounterApp() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.trim() === "" ? 0 : (text.match(/[^.!?]*[.!?]+/g) ?? []).length || (text.trim() ? 1 : 0);
    const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0);
    const uniqueWords = text.trim() === "" ? 0 : new Set(text.toLowerCase().match(/\b\w+\b/g) ?? []).size;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, charsNoSpaces, sentences, paragraphs, uniqueWords, readingTime };
  }, [text]);

  function handleCopyStats() {
    const statsText = [
      `Words: ${stats.words}`,
      `Characters (with spaces): ${stats.chars}`,
      `Characters (without spaces): ${stats.charsNoSpaces}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Unique words: ${stats.uniqueWords}`,
      `Reading time: ~${stats.readingTime} min`,
    ].join("\n");
    copyText(statsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const statItems = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "Chars (no spaces)", value: stats.charsNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Unique words", value: stats.uniqueWords },
    { label: "Reading time", value: `~${stats.readingTime} min` },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Your text</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-96 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="Paste or type your text here…"
          spellCheck={false}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-950">Statistics</h3>
          <button
            onClick={handleCopyStats}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {copied ? "✓ Copied" : "Copy stats"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-2xl font-bold text-slate-950">{item.value}</div>
              <div className="mt-0.5 text-xs text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
