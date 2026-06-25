import { useState } from "react";

const LOCALES = [
  { code: "en-US", label: "en-US (English, US)" },
  { code: "en-GB", label: "en-GB (English, UK)" },
  { code: "de-DE", label: "de-DE (German)" },
  { code: "fr-FR", label: "fr-FR (French)" },
  { code: "pt-BR", label: "pt-BR (Portuguese, Brazil)" },
  { code: "ja-JP", label: "ja-JP (Japanese)" },
  { code: "zh-CN", label: "zh-CN (Chinese)" },
  { code: "ar-SA", label: "ar-SA (Arabic)" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "BRL", "JPY", "CNY", "INR", "CHF", "CAD", "AUD"];

export default function NumberFormatterApp() {
  const [input, setInput] = useState("1234567.89");
  const [locale, setLocale] = useState("en-US");
  const [style, setStyle] = useState<"decimal" | "currency" | "percent">("decimal");
  const [currency, setCurrency] = useState("USD");
  const [minDec, setMinDec] = useState(2);
  const [maxDec, setMaxDec] = useState(2);
  const [copied, setCopied] = useState<string | null>(null);

  const num = parseFloat(input);
  const isValid = !isNaN(num);

  function format(opts: Intl.NumberFormatOptions = {}): string {
    if (!isValid) return "—";
    try {
      return new Intl.NumberFormat(locale, {
        style,
        ...(style === "currency" ? { currency } : {}),
        minimumFractionDigits: minDec,
        maximumFractionDigits: maxDec,
        ...opts,
      }).format(num);
    } catch {
      return "—";
    }
  }

  const formatted = format();
  const scientific = isValid ? num.toExponential(maxDec) : "—";
  const engineering = isValid ? (() => {
    const exp = Math.floor(Math.log10(Math.abs(num)) / 3) * 3;
    const mantissa = (num / Math.pow(10, exp)).toFixed(maxDec);
    return `${mantissa} × 10^${exp}`;
  })() : "—";

  function copy(val: string) {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(val);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Settings</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Number</label>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="w-48 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Locale</label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {LOCALES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value as "decimal" | "currency" | "percent")} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <option value="decimal">Decimal</option>
              <option value="currency">Currency</option>
              <option value="percent">Percent</option>
            </select>
          </div>
          {style === "currency" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Min decimals</label>
            <input type="number" min={0} max={20} value={minDec} onChange={(e) => setMinDec(Number(e.target.value))} className="w-20 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Max decimals</label>
            <input type="number" min={0} max={20} value={maxDec} onChange={(e) => setMaxDec(Number(e.target.value))} className="w-20 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Results</h3>
        <div className="divide-y divide-slate-100">
          {[
            { label: "Formatted", value: formatted },
            { label: "Scientific notation", value: scientific },
            { label: "Engineering notation", value: engineering },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-semibold text-slate-800">{value}</span>
                <button onClick={() => copy(value)} className="text-xs text-slate-400 hover:text-slate-700">
                  {copied === value ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
