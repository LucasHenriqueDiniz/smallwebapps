import { useState } from "react";

const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function generateString(length: number, charset: string): string {
  if (!charset) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((n) => charset[n % charset.length]).join("");
}

export default function RandomStringApp() {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [count, setCount] = useState(5);
  const [strings, setStrings] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  function getCharset() {
    let cs = "";
    if (useLower) cs += CHARSETS.lower;
    if (useUpper) cs += CHARSETS.upper;
    if (useDigits) cs += CHARSETS.digits;
    if (useSymbols) cs += CHARSETS.symbols;
    if (useCustom && custom) cs += custom;
    return cs || CHARSETS.lower;
  }

  function generate() {
    const cs = getCharset();
    setStrings(Array.from({ length: count }, () => generateString(length, cs)));
  }

  function copyOne(i: number) {
    navigator.clipboard.writeText(strings[i]).then(() => {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  }

  function copyAll() {
    navigator.clipboard.writeText(strings.join("\n")).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">String length (1–1000)</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(1000, Number(e.target.value))))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Number of strings (1–100)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Lowercase a-z", state: useLower, set: setUseLower },
            { label: "Uppercase A-Z", state: useUpper, set: setUseUpper },
            { label: "Digits 0-9", state: useDigits, set: setUseDigits },
            { label: "Symbols", state: useSymbols, set: setUseSymbols },
          ].map(({ label, state, set }) => (
            <label key={label} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={state} onChange={(e) => set(e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
            Custom chars:
          </label>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            disabled={!useCustom}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono outline-none ring-2 ring-transparent focus:ring-blue-200 disabled:opacity-40"
            placeholder="Enter custom characters…"
          />
        </div>
        <button
          onClick={generate}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Generate
        </button>
      </section>

      {strings.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">{strings.length} string{strings.length > 1 ? "s" : ""}</h3>
            {strings.length > 1 && (
              <button onClick={copyAll} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                {allCopied ? "✓ All copied" : "Copy all"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {strings.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <span className="flex-1 font-mono text-sm text-slate-800 break-all select-all">{s}</span>
                <button
                  onClick={() => copyOne(i)}
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
