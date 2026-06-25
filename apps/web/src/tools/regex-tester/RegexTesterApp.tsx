import { useMemo, useState } from "react";

export default function RegexTesterApp() {
  const [pattern, setPattern] = useState("[A-Z]\\w+");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testStr, setTestStr] = useState("The Quick Brown Fox jumps over the Lazy Dog");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join("");

  const result = useMemo(() => {
    if (!pattern) return { error: "", matches: [], highlighted: testStr };
    try {
      const re = new RegExp(pattern, flagStr || "g");
      const matches: Array<{ match: string; index: number; groups: string[] }> = [];
      let m: RegExpExecArray | null;
      const re2 = new RegExp(pattern, (flagStr.includes("g") ? flagStr : flagStr + "g"));
      while ((m = re2.exec(testStr)) !== null) {
        matches.push({
          match: m[0],
          index: m.index,
          groups: m.slice(1),
        });
        if (!re2.global) break;
      }

      // Build highlighted string
      let last = 0;
      let highlighted = "";
      const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
      for (const { match, index } of sortedMatches) {
        highlighted += testStr.slice(last, index).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        highlighted += `<mark class="bg-yellow-200 rounded">${match.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</mark>`;
        last = index + match.length;
      }
      highlighted += testStr.slice(last).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      return { error: "", matches, highlighted };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Invalid regex", matches: [], highlighted: testStr };
    }
  }, [pattern, flagStr, testStr]);

  function copyMatch(i: number, val: string) {
    navigator.clipboard.writeText(val).then(() => {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Pattern</h3>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            placeholder="Regular expression…"
            spellCheck={false}
          />
          <span className="text-slate-400 font-mono">/</span>
          <div className="flex gap-3">
            {(["g", "i", "m", "s"] as const).map((f) => (
              <label key={f} className="flex cursor-pointer items-center gap-1 text-sm text-slate-700 font-mono">
                <input
                  type="checkbox"
                  checked={flags[f]}
                  onChange={(e) => setFlags((prev) => ({ ...prev, [f]: e.target.checked }))}
                />
                {f}
              </label>
            ))}
          </div>
        </div>
        {result.error && <p className="mt-2 text-xs text-red-600">{result.error}</p>}
        {!result.error && pattern && (
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-600">{result.matches.length}</span> match{result.matches.length !== 1 ? "es" : ""}
          </p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Test string</h3>
          <textarea
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            className="min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Highlighted matches</h3>
          <div
            className="min-h-40 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: result.highlighted }}
          />
        </section>
      </div>

      {result.matches.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Matches</h3>
          <div className="space-y-2">
            {result.matches.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-xs text-slate-400 w-8 shrink-0">#{i + 1}</span>
                <span className="font-mono text-sm font-semibold text-slate-800 flex-1">{m.match}</span>
                <span className="text-xs text-slate-400">index {m.index}</span>
                {m.groups.length > 0 && (
                  <span className="text-xs text-blue-500">groups: [{m.groups.join(", ")}]</span>
                )}
                <button
                  onClick={() => copyMatch(i, m.match)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
                >
                  {copiedIdx === i ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
