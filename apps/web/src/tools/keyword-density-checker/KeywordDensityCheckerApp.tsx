import { useMemo, useState } from "react";

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in", "is", "it", "its",
  "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "you", "your", "this", "we",
]);

function wordsFrom(text: string) {
  return text.toLowerCase().match(/[a-z0-9]+(?:'[a-z0-9]+)?/g) ?? [];
}

export default function KeywordDensityCheckerApp() {
  const [text, setText] = useState("");
  const [ignoreStopwords, setIgnoreStopwords] = useState(true);
  const [phraseSize, setPhraseSize] = useState(1);

  const report = useMemo(() => {
    const words = wordsFrom(text);
    const filtered = ignoreStopwords ? words.filter((word) => !STOPWORDS.has(word)) : words;
    const counts = new Map<string, number>();

    for (let i = 0; i <= filtered.length - phraseSize; i += 1) {
      const phrase = filtered.slice(i, i + phraseSize).join(" ");
      if (phrase) counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }

    const rows = [...counts.entries()]
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: filtered.length ? (count / Math.max(1, filtered.length - phraseSize + 1)) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword))
      .slice(0, 25);

    return {
      words: words.length,
      filtered: filtered.length,
      unique: counts.size,
      rows,
      topCount: rows[0]?.count ?? 1,
    };
  }, [ignoreStopwords, phraseSize, text]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">SEO text audit</p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-950">Paste page copy</h3>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
            {[1, 2, 3].map((size) => (
              <button
                key={size}
                onClick={() => setPhraseSize(size)}
                className={`rounded-lg px-3 py-1.5 transition ${phraseSize === size ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-950"}`}
              >
                {size === 1 ? "Words" : `${size}-word`}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste article text, landing page copy, or product content here..."
          className="min-h-[360px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-500"
        />

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={ignoreStopwords}
            onChange={(event) => setIgnoreStopwords(event.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Ignore common stopwords
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-extrabold text-slate-950">Density report</h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Words", report.words],
            ["Analyzed", report.filtered],
            ["Unique", report.unique],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <div className="text-lg font-extrabold text-slate-950">{value}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-2">
          {report.rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Add text to see repeated keywords and phrases.
            </div>
          )}
          {report.rows.map((row) => (
            <div key={row.keyword} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-800">{row.keyword}</span>
                <span className="text-xs font-bold text-slate-500">{row.count} / {row.density.toFixed(2)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.max(6, (row.count / report.topCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
