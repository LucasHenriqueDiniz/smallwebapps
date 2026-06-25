import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, Scissors } from "lucide-react";

export default function PdfSplitApp() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [mode, setMode] = useState<"all" | "range">("all");
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const loadPdf = useCallback(async (f: File) => {
    setError("");
    setDone(false);
    setFile(f);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const n = doc.getPageCount();
      setNumPages(n);
      setFrom("1");
      setTo(String(n));
    } catch {
      setError("Could not read this PDF. It may be password-protected.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && loadPdf(files[0]),
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  async function splitAll() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buf);
      for (let i = 0; i < numPages; i++) {
        const newDoc = await PDFDocument.create();
        const [page] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(page);
        const bytes = await newDoc.save();
        downloadBytes(bytes, `page-${i + 1}.pdf`);
      }
      setDone(true);
    } catch {
      setError("Failed to split PDF.");
    } finally {
      setLoading(false);
    }
  }

  async function extractRange() {
    if (!file) return;
    const f = parseInt(from) - 1;
    const t = parseInt(to) - 1;
    if (isNaN(f) || isNaN(t) || f < 0 || t >= numPages || f > t) {
      setError(`Enter a valid range between 1 and ${numPages}.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buf);
      const newDoc = await PDFDocument.create();
      const indices = Array.from({ length: t - f + 1 }, (_, i) => f + i);
      const pages = await newDoc.copyPages(srcDoc, indices);
      pages.forEach((p) => newDoc.addPage(p));
      const bytes = await newDoc.save();
      downloadBytes(bytes, `pages-${from}-to-${to}.pdf`);
      setDone(true);
    } catch {
      setError("Failed to extract pages.");
    } finally {
      setLoading(false);
    }
  }

  function downloadBytes(bytes: Uint8Array, name: string) {
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5">
      {!file ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Drop a PDF or click to browse</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">{file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{numPages} pages</p>
            </div>
            <button
              onClick={() => { setFile(null); setNumPages(0); setDone(false); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Change file
            </button>
          </div>

          <div className="mb-4 flex gap-2">
            {(["all", "range"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  mode === m
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {m === "all" ? `Split all ${numPages} pages` : "Extract a range"}
              </button>
            ))}
          </div>

          {mode === "range" && (
            <div className="mb-4 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">From page</label>
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">To page</label>
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>
          )}

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          {done && <p className="mb-3 text-sm text-emerald-600">✓ Done — check your downloads folder</p>}

          <button
            onClick={mode === "all" ? splitAll : extractRange}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Scissors className="h-4 w-4" />
            {loading ? "Processing…" : mode === "all" ? "Split into individual pages" : "Extract page range"}
          </button>
        </div>
      )}
    </div>
  );
}
