import { useCallback, useEffect, useState } from "react";

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const UPPERCASE_FULL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
const LOWERCASE_FULL = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "23456789";
const NUMBERS_FULL = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

function calcEntropy(charSpace: number, length: number) {
  return length * Math.log2(charSpace);
}

function strengthLabel(entropy: number) {
  if (entropy < 36) return { label: "Weak", color: "bg-red-500", pct: 20 };
  if (entropy < 60) return { label: "Fair", color: "bg-amber-400", pct: 45 };
  if (entropy < 80) return { label: "Strong", color: "bg-blue-500", pct: 70 };
  return { label: "Very Strong", color: "bg-emerald-500", pct: 100 };
}

export default function PasswordGeneratorApp() {
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let charset = "";
    if (useUpper) charset += excludeAmbiguous ? UPPERCASE : UPPERCASE_FULL;
    if (useLower) charset += excludeAmbiguous ? LOWERCASE : LOWERCASE_FULL;
    if (useNumbers) charset += excludeAmbiguous ? NUMBERS : NUMBERS_FULL;
    if (useSymbols) charset += SYMBOLS;
    if (!charset) charset = LOWERCASE_FULL;

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr).map((n) => charset[n % charset.length]).join(""));
  }, [length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  useEffect(() => { generatePassword(); }, [generatePassword]);

  const charSpace = (useUpper ? (excludeAmbiguous ? UPPERCASE.length : UPPERCASE_FULL.length) : 0)
    + (useLower ? (excludeAmbiguous ? LOWERCASE.length : LOWERCASE_FULL.length) : 0)
    + (useNumbers ? (excludeAmbiguous ? NUMBERS.length : NUMBERS_FULL.length) : 0)
    + (useSymbols ? SYMBOLS.length : 0) || 26;

  const entropy = calcEntropy(charSpace, length);
  const strength = strengthLabel(entropy);

  function handleCopy() {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="mx-auto max-w-xl grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Settings</h3>

        <div className="mb-4">
          <div className="mb-1.5 flex justify-between">
            <label className="text-xs font-medium text-slate-500">Length</label>
            <span className="text-xs font-bold text-slate-950">{length}</span>
          </div>
          <input
            type="range"
            min={8}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Uppercase (A-Z)", state: useUpper, set: setUseUpper },
            { label: "Lowercase (a-z)", state: useLower, set: setUseLower },
            { label: "Numbers (0-9)", state: useNumbers, set: setUseNumbers },
            { label: "Symbols (!@#…)", state: useSymbols, set: setUseSymbols },
          ].map(({ label, state, set }) => (
            <label key={label} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={state} onChange={(e) => set(e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
          />
          Exclude ambiguous characters (0, O, l, 1, I)
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-950">Generated password</h3>
          <div className="flex gap-2">
            <button
              onClick={generatePassword}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Regenerate
            </button>
            <button
              onClick={handleCopy}
              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-base font-bold tracking-wider text-slate-900 break-all select-all">
          {password}
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-medium text-slate-500">Strength</span>
            <span className="font-semibold text-slate-700">{strength.label} — {Math.round(entropy)} bits</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className={`h-2 rounded-full transition-all ${strength.color}`}
              style={{ width: `${strength.pct}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
