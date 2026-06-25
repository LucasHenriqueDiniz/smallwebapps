import { useState, useMemo } from "react";

const DEFAULT_URL = "https://example.com:8080/path/to/page?name=Alice&role=admin&debug=true#section-2";

export default function UrlParserApp() {
  const [input, setInput] = useState(DEFAULT_URL);
  const [editParts, setEditParts] = useState<Record<string, string> | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      return new URL(input);
    } catch {
      return null;
    }
  }, [input]);

  const searchParams = useMemo(() => {
    if (!parsed) return [];
    const entries: { key: string; value: string }[] = [];
    parsed.searchParams.forEach((v, k) => entries.push({ key: k, value: v }));
    return entries;
  }, [parsed]);

  const reconstructed = useMemo(() => {
    if (!editParts) return input;
    try {
      const url = new URL(editParts.origin + editParts.pathname + editParts.search + editParts.hash);
      return url.toString();
    } catch {
      return input;
    }
  }, [editParts, input]);

  function startEdit() {
    if (!parsed) return;
    setEditParts({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      origin: parsed.origin,
    });
  }

  function copyUrl() {
    const url = editParts ? reconstructed : input;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const fields = parsed
    ? [
        { label: "Protocol", value: parsed.protocol.replace(":", "") },
        { label: "Host", value: parsed.host },
        { label: "Hostname", value: parsed.hostname },
        { label: "Port", value: parsed.port || "(default)" },
        { label: "Pathname", value: parsed.pathname },
        { label: "Search", value: parsed.search || "(none)" },
        { label: "Hash", value: parsed.hash || "(none)" },
        { label: "Origin", value: parsed.origin },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-950">URL Input</h3>
          <button onClick={copyUrl} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copied ? "✓ Copied" : "Copy URL"}
          </button>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setEditParts(null); }}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="Paste a URL here…"
          spellCheck={false}
        />
        {input && !parsed && (
          <p className="mt-2 text-xs font-medium text-red-600">✗ Invalid URL</p>
        )}
      </section>

      {parsed && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-base font-semibold text-slate-950">Breakdown</h3>
            <dl className="space-y-2">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="shrink-0 font-medium text-slate-500 w-24">{label}</dt>
                  <dd className="text-right font-mono text-slate-800 break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-base font-semibold text-slate-950">Query Parameters</h3>
            {searchParams.length === 0 ? (
              <p className="text-sm text-slate-400">No query parameters</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-100">
                    <th className="pb-2 pr-4">Key</th>
                    <th className="pb-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchParams.map(({ key, value }) => (
                    <tr key={key}>
                      <td className="py-2 pr-4 font-mono text-slate-700">{key}</td>
                      <td className="py-2 font-mono text-slate-800 break-all">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={startEdit} className="mt-4 text-xs text-blue-600 hover:underline">
              Edit parts
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
