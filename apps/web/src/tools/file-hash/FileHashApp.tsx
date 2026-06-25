import { useRef, useState } from "react";

const ALGOS = ["SHA-1", "SHA-256", "SHA-512"] as const;

async function hashBuffer(buf: ArrayBuffer, algo: string): Promise<string> {
  const hashBuf = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function FileHashApp() {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    setHashes({});
    setLoading(true);
    setProgress(0);

    try {
      const buf = await file.arrayBuffer();
      setProgress(50);

      const results: Record<string, string> = {};
      let done = 0;
      for (const algo of ALGOS) {
        results[algo] = await hashBuffer(buf, algo);
        done++;
        setProgress(50 + Math.round((done / ALGOS.length) * 50));
      }
      setHashes(results);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }

  function copyHash(key: string) {
    navigator.clipboard.writeText(hashes[key]).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Drop a file to hash</h3>
        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-6 text-sm text-slate-500 hover:bg-slate-100 transition"
        >
          {loading ? "Hashing…" : (fileName || "Click to select any file")}
        </button>
        {loading && (
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {fileName && !loading && (
          <p className="mt-2 text-xs text-slate-500">
            {fileName} — {(fileSize / 1024).toFixed(1)} KB
          </p>
        )}
      </section>

      {Object.keys(hashes).length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Hash results</h3>
          <div className="space-y-4">
            {ALGOS.map((algo) => (
              <div key={algo}>
                <label className="mb-1 block text-xs font-medium text-slate-500">{algo}</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700 break-all select-all">
                    {hashes[algo]}
                  </div>
                  <button
                    onClick={() => copyHash(algo)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shrink-0"
                  >
                    {copiedKey === algo ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
