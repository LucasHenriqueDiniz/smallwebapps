import { useMemo, useState } from "react";

function encodeEntities(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/[^\x00-\x7E]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function decodeEntities(str: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

const COMMON_ENTITIES = [
  { entity: "&amp;", char: "&", desc: "Ampersand" },
  { entity: "&lt;", char: "<", desc: "Less than" },
  { entity: "&gt;", char: ">", desc: "Greater than" },
  { entity: "&quot;", char: '"', desc: "Quotation mark" },
  { entity: "&apos;", char: "'", desc: "Apostrophe" },
  { entity: "&nbsp;", char: " ", desc: "Non-breaking space" },
  { entity: "&copy;", char: "©", desc: "Copyright" },
  { entity: "&reg;", char: "®", desc: "Registered trademark" },
  { entity: "&trade;", char: "™", desc: "Trademark" },
  { entity: "&mdash;", char: "—", desc: "Em dash" },
  { entity: "&ndash;", char: "–", desc: "En dash" },
  { entity: "&euro;", char: "€", desc: "Euro sign" },
  { entity: "&pound;", char: "£", desc: "Pound sign" },
  { entity: "&yen;", char: "¥", desc: "Yen sign" },
  { entity: "&hellip;", char: "…", desc: "Ellipsis" },
];

export default function HtmlEntitiesApp() {
  const [tab, setTab] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState('<h1>Hello "World" & Friends</h1>');
  const [copied, setCopied] = useState(false);
  const [showRef, setShowRef] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    return tab === "encode" ? encodeEntities(input) : decodeEntities(input);
  }, [tab, input]);

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 max-w-xs">
        {(["encode", "decode"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${t === tab ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Output</h3>
            <button onClick={handleCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            className="min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700 outline-none"
          />
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <button
          onClick={() => setShowRef(!showRef)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <span>{showRef ? "▼" : "▶"}</span>
          Common HTML entities reference
        </button>
        {showRef && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-2 pr-4">Entity</th>
                  <th className="pb-2 pr-4">Character</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {COMMON_ENTITIES.map(({ entity, char, desc }) => (
                  <tr key={entity} className="border-b border-slate-50">
                    <td className="py-1.5 pr-4 font-mono text-blue-700">{entity}</td>
                    <td className="py-1.5 pr-4 font-mono text-slate-800">{char}</td>
                    <td className="py-1.5 text-slate-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
