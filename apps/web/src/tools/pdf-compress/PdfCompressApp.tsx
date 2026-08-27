import { useRef, useState } from "react";

interface Props {
  targetKB?: number;
}

export default function PdfCompressApp({ targetKB }: Props) {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setOriginalSize(file.size);
    setPdfData(await file.arrayBuffer());
    setCompressedSize(null);
  }

  async function handleCompress() {
    if (!pdfData) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      // updateMetadata:false keeps the original Producer and ModDate. pdf-lib
      // otherwise stamps its own, which contradicts the promise that the file
      // comes back unchanged apart from its structure.
      const doc = await PDFDocument.load(pdfData, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      // Object streams pack many small objects into one compressed stream and
      // replace the classic cross-reference table with a cross-reference
      // stream. That is where the saving comes from. Saving with them off does
      // the reverse: it expands a modern PDF, roughly doubling a text-heavy one.
      const rebuilt = await doc.save({ useObjectStreams: true });
      // A PDF already using these structures cannot be improved this way. Hand
      // back the original rather than a rebuild that is the same size or larger.
      const smaller = rebuilt.length < pdfData.byteLength;
      const bytes = smaller ? rebuilt : new Uint8Array(pdfData);
      setCompressedSize(bytes.length);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      // Do not call it "-compressed" when it is the original file untouched.
      a.download = fileName.replace(/\.pdf$/i, smaller ? "-compressed.pdf" : "-unchanged.pdf");
      a.click();
    } finally {
      setProcessing(false);
    }
  }

  function fmtKB(bytes: number) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  const saved = compressedSize !== null ? originalSize - compressedSize : null;
  const pct = saved !== null && originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Upload PDF</h3>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:bg-slate-100 transition">
          {pdfData ? fileName : "Click to upload a PDF"}
        </button>
        {pdfData && <p className="mt-2 text-xs text-slate-500">Original size: {fmtKB(originalSize)}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-2 text-base font-semibold text-slate-950">
          {targetKB ? `Try to compress toward ${targetKB}KB` : "About this tool"}
        </h3>
        <p className="mb-4 text-sm text-slate-600">
          This tool rebuilds the PDF using object streams and a cross-reference stream, which pack the document's internal
          objects more tightly than a classic cross-reference table. PDFs written by older software gain the most; a file already
          using these structures is returned unchanged rather than rebuilt.
          It does not re-encode or discard images. For significant file size reduction, image re-encoding is required — which cannot be done safely in the browser without potentially altering image quality.
          {targetKB ? ` Exact ${targetKB}KB output is not guaranteed for every PDF.` : ""}
        </p>
        <button
          onClick={handleCompress}
          disabled={!pdfData || processing}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
        >
          {processing ? "Compressing…" : "Compress & Download"}
        </button>
      </section>

      {compressedSize !== null && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Results</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <div className="text-sm text-slate-500">Original</div>
              <div className="font-bold text-slate-950">{fmtKB(originalSize)}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <div className="text-sm text-slate-500">Compressed</div>
              <div className="font-bold text-slate-950">{fmtKB(compressedSize)}</div>
            </div>
            <div className={`rounded-xl border p-3 text-center ${(saved ?? 0) > 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
              <div className="text-sm text-slate-500">Saved</div>
              <div className={`font-bold ${(saved ?? 0) > 0 ? "text-emerald-700" : "text-slate-500"}`}>
                {(saved ?? 0) > 0 ? `${pct}%` : "Already optimized"}
              </div>
            </div>
          </div>
          {(saved ?? 0) <= 0 && (
            <p className="mt-3 text-xs leading-5 text-slate-500">
              This PDF already uses compressed object and cross-reference streams, so there is nothing left for a structural
              rebuild to remove. You downloaded the original file, byte for byte.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
