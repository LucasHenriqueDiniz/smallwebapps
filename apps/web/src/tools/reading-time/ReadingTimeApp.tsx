import { useMemo, useState } from "react";

export default function ReadingTimeApp() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const sentences = text.trim() === "" ? 0 : (text.match(/[^.!?]+[.!?]+/g) ?? []).length || (text.trim() ? 1 : 0);

    function readingTime(wpm: number) {
      const mins = words / wpm;
      if (mins < 1) return "< 1 min";
      const m = Math.floor(mins);
      const s = Math.round((mins - m) * 60);
      return s > 0 ? `${m} min ${s} sec` : `${m} min`;
    }

    return { words, chars, sentences, slow: readingTime(200), average: readingTime(250), fast: readingTime(400) };
  }, [text]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Paste your text</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-96 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="Paste an article, essay, or any text to estimate reading time…"
          spellCheck={false}
        />
      </section>

      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Reading time</h3>
          <div className="space-y-3">
            {[
              { label: "Slow (200 wpm)", value: stats.slow },
              { label: "Average (250 wpm)", value: stats.average },
              { label: "Fast (400 wpm)", value: stats.fast },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-sm font-bold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Text stats</h3>
          <div className="space-y-3">
            {[
              { label: "Words", value: stats.words },
              { label: "Characters", value: stats.chars },
              { label: "Sentences", value: stats.sentences },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-sm font-bold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
