import { useRef, useState } from "react";

export default function Base64EncoderApp() {
  const [tab, setTab] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileResult, setFileResult] = useState("");
  const [fileCopied, setFileCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const output = (() => {
    if (!input) return "";
    try {
      if (tab === "encode") return btoa(unescape(encodeURIComponent(input)));
      return decodeURIComponent(escape(atob(input)));
    } catch {
      return tab === "decode" ? "⚠ Invalid base64 input" : "";
    }
  })();

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setFileResult(dataUri);
    };
    reader.readAsDataURL(file);
  }

  function handleFileCopy() {
    navigator.clipboard.writeText(fileResult).then(() => {
      setFileCopied(true);
      setTimeout(() => setFileCopied(false), 1800);
    });
  }

  function downloadFileResult() {
    const blob = new Blob([fileResult], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "base64-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5">
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 max-w-xs">
        {(["encode", "decode"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setInput(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${t === tab ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">
            {tab === "encode" ? "Plain text input" : "Base64 input"}
          </h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            placeholder={tab === "encode" ? "Enter text to encode…" : "Paste base64 to decode…"}
            spellCheck={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">
              {tab === "encode" ? "Base64 output" : "Decoded text"}
            </h3>
            {output && !output.startsWith("⚠") && (
              <button onClick={handleCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700 outline-none"
            placeholder="Output will appear here…"
          />
        </section>
      </div>

      {tab === "encode" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Encode a file</h3>
          <p className="mb-3 text-sm text-slate-500">Drop or select any file to get its base64 data URI.</p>
          <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500 hover:bg-slate-100 transition w-full"
          >
            Click to select a file
          </button>
          {fileResult && (
            <div className="mt-4">
              <div className="mb-2 font-mono text-xs text-slate-500 break-all">{fileResult.slice(0, 120)}…</div>
              <div className="flex gap-2">
                <button onClick={handleFileCopy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                  {fileCopied ? "✓ Copied" : "Copy data URI"}
                </button>
                <button onClick={downloadFileResult} className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition">
                  Download .txt
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
