import { useEffect, useRef, useState } from "react";

async function hashText(text: string, algo: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashBuffer(buf: ArrayBuffer, algo: string): Promise<string> {
  const hashBuf = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ALGOS = ["SHA-1", "SHA-256", "SHA-512"] as const;

export default function HashGeneratorApp() {
  const [input, setInput] = useState("Hello, World!");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const [fileCopiedKey, setFileCopiedKey] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function compute() {
      const results: Record<string, string> = {};
      for (const algo of ALGOS) {
        results[algo] = await hashText(input, algo);
      }
      setHashes(results);
    }
    compute();
  }, [input]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileLoading(true);
    const buf = await file.arrayBuffer();
    const results: Record<string, string> = {};
    for (const algo of ALGOS) {
      results[algo] = await hashBuffer(buf, algo);
    }
    setFileHashes(results);
    setFileLoading(false);
  }

  function copyHash(key: string, value: string, isFile = false) {
    navigator.clipboard.writeText(value).then(() => {
      if (isFile) {
        setFileCopiedKey(key);
        setTimeout(() => setFileCopiedKey(null), 1800);
      } else {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
      }
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Hash text</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
          placeholder="Enter text to hash…"
          spellCheck={false}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Text hashes</h3>
        <div className="space-y-3">
          {ALGOS.map((algo) => (
            <div key={algo}>
              <label className="mb-1 block text-xs font-medium text-slate-500">{algo}</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 break-all">
                  {hashes[algo] || "—"}
                </div>
                <button
                  onClick={() => copyHash(algo, hashes[algo] ?? "")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
                >
                  {copiedKey === algo ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Hash a file</h3>
        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500 hover:bg-slate-100 transition"
        >
          {fileLoading ? "Computing…" : "Click to select a file"}
        </button>
        {fileName && Object.keys(fileHashes).length > 0 && (
          <div className="mt-4">
            <p className="mb-3 text-xs font-medium text-slate-600">File: {fileName}</p>
            <div className="space-y-3">
              {ALGOS.map((algo) => (
                <div key={algo}>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{algo}</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 break-all">
                      {fileHashes[algo] || "—"}
                    </div>
                    <button
                      onClick={() => copyHash(algo, fileHashes[algo] ?? "", true)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
                    >
                      {fileCopiedKey === algo ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
