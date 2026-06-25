import { useRef, useState } from "react";
import { degrees, PDFDocument } from "pdf-lib";

export default function PdfRotateApp() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"all" | "specific">("all");
  const [rotation, setRotation] = useState(90);
  const [pageRange, setPageRange] = useState("");
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const data = await file.arrayBuffer();
    setPdfData(data);
    const doc = await PDFDocument.load(data, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
  }

  function parseRange(rangeStr: string, total: number): number[] {
    const indices: number[] = [];
    const parts = rangeStr.split(",");
    for (const part of parts) {
      const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!m) continue;
      const start = parseInt(m[1]) - 1;
      const end = m[2] ? parseInt(m[2]) - 1 : start;
      for (let i = Math.max(0, start); i <= Math.min(total - 1, end); i++) {
        if (!indices.includes(i)) indices.push(i);
      }
    }
    return indices;
  }

  async function handleRotate() {
    if (!pdfData) return;
    setProcessing(true);
    try {
      const doc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
      const total = doc.getPageCount();
      const indices = mode === "all" ? Array.from({ length: total }, (_, i) => i) : parseRange(pageRange, total);

      for (const i of indices) {
        const page = doc.getPage(i);
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation) % 360));
      }

      const bytes = await doc.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName.replace(/\.pdf$/i, "-rotated.pdf");
      a.click();
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Upload PDF</h3>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:bg-slate-100 transition">
          {pdfData ? fileName : "Click to upload a PDF"}
        </button>
        {pdfData && <p className="mt-2 text-xs text-slate-500">{pageCount} page{pageCount !== 1 ? "s" : ""}</p>}
      </section>

      {pdfData && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Rotation options</h3>

          <div className="mb-4 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["all", "specific"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${m === mode ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
              >
                {m === "all" ? "All pages" : "Specific pages"}
              </button>
            ))}
          </div>

          {mode === "specific" && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Page range (e.g. 1-3, 5, 7-9)</label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200"
                placeholder="1, 3-5, 7"
              />
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {[90, 180, 270].map((deg) => (
              <button
                key={deg}
                onClick={() => setRotation(deg)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${rotation === deg ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                +{deg}° CW
              </button>
            ))}
          </div>

          <button
            onClick={handleRotate}
            disabled={processing}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
          >
            {processing ? "Processing…" : "Rotate & Download"}
          </button>
        </section>
      )}
    </div>
  );
}
