import { useMemo, useState } from "react";

export default function FindReplaceApp() {
  const [findStr, setFindStr] = useState("");
  const [replaceStr, setReplaceStr] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [inputText, setInputText] = useState("The quick brown fox jumps over the lazy dog.\nThe dog barked at the fox.");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!findStr) return { output: inputText, count: 0, error: "" };
    try {
      let pattern: RegExp;
      if (useRegex) {
        pattern = new RegExp(findStr, caseSensitive ? "g" : "gi");
      } else {
        const escaped = findStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pattern = new RegExp(escaped, caseSensitive ? "g" : "gi");
      }
      const matches = inputText.match(pattern);
      const count = matches ? matches.length : 0;
      const output = inputText.replace(pattern, replaceStr);
      return { output, count, error: "" };
    } catch (e) {
      return { output: inputText, count: 0, error: e instanceof Error ? e.message : "Invalid regex" };
    }
  }, [findStr, replaceStr, useRegex, caseSensitive, inputText]);

  function handleCopy() {
    navigator.clipboard.writeText(result.output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Find & Replace</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Find</label>
            <input
              type="text"
              value={findStr}
              onChange={(e) => setFindStr(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
              placeholder="Search term or regex…"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Replace with</label>
            <input
              type="text"
              value={replaceStr}
              onChange={(e) => setReplaceStr(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
              placeholder="Replacement text…"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
            Use Regex
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
            Case Sensitive
          </label>
        </div>
        {result.error && (
          <p className="mt-2 text-xs text-red-600">{result.error}</p>
        )}
        {findStr && !result.error && (
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-600">{result.count}</span> match{result.count !== 1 ? "es" : ""} found
          </p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Input text</h3>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Output</h3>
            <button
              onClick={handleCopy}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={result.output}
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none"
          />
        </section>
      </div>
    </div>
  );
}
