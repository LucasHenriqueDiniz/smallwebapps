import { useState, useRef, useCallback } from "react";

// Restricted to languages whose alphabets fit the WinAnsi encoding of the
// standard PDF fonts — the invisible text layer cannot encode other scripts.
const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "por", label: "Portuguese" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "nld", label: "Dutch" },
];

const MAX_PAGES = 50;

type Status = "idle" | "loading" | "working" | "done" | "error";

interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export default function SearchablePdfApp() {
  const [language, setLanguage] = useState("eng");
  const [status, setStatus] = useState<Status>("idle");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageProgress, setPageProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [wordTotal, setWordTotal] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef(language);
  languageRef.current = language;

  const processPdf = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setStatus("error");
      return;
    }
    setError("");
    setNotice("");
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setResultSize(0);
    setWordTotal(0);
    setFileName(file.name);
    setCurrentPage(0);
    setTotalPages(0);
    setPageProgress(0);
    setStatus("loading");
    try {
      const [pdfjsLib, { createWorker }, { PDFDocument, StandardFonts, rgb }] = await Promise.all([
        import("pdfjs-dist"),
        import("tesseract.js"),
        import("pdf-lib"),
      ]);
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
      const outDoc = await PDFDocument.load(bytes, { ignoreEncryption: false });
      const font = await outDoc.embedFont(StandardFonts.Helvetica);
      const pageCount = Math.min(pdf.numPages, MAX_PAGES);
      if (pdf.numPages > MAX_PAGES) {
        setNotice(`This PDF has ${pdf.numPages} pages; only the first ${MAX_PAGES} received a text layer. Split the PDF to handle the rest.`);
      }
      setTotalPages(pageCount);

      const worker = await createWorker(languageRef.current, 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setPageProgress(m.progress);
        },
      });
      try {
        const renderScale = 2;
        let recognizedWords = 0;
        for (let i = 1; i <= pageCount; i++) {
          setCurrentPage(i);
          setPageProgress(0);
          setStatus("working");
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: renderScale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true });
          canvas.width = 0;
          canvas.height = 0;

          const words: OcrWord[] = [];
          for (const block of data.blocks ?? [])
            for (const para of block.paragraphs)
              for (const line of para.lines)
                for (const w of line.words) words.push({ text: w.text, bbox: w.bbox });

          const outPage = outDoc.getPage(i - 1);
          // Map canvas pixels back to PDF points. Uses the output page's own
          // size so the overlay stays aligned even if pdf-lib and pdfjs
          // disagree slightly about the page box.
          const sx = outPage.getWidth() / viewport.width;
          const sy = outPage.getHeight() / viewport.height;
          for (const w of words) {
            const text = w.text.trim();
            const h = (w.bbox.y1 - w.bbox.y0) * sy;
            if (!text || h <= 0) continue;
            try {
              outPage.drawText(text, {
                x: w.bbox.x0 * sx,
                y: outPage.getHeight() - w.bbox.y1 * sy,
                size: h,
                font,
                color: rgb(0, 0, 0),
                opacity: 0,
              });
              recognizedWords++;
            } catch {
              // Word contains characters the standard font cannot encode — skip it.
            }
          }
        }
        const outBytes = await outDoc.save();
        const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
        setWordTotal(recognizedWords);
        setStatus("done");
      } finally {
        await worker.terminate();
      }
    } catch {
      setError("Could not process this PDF. It may be corrupted or password-protected — or recognition failed. Reload the page and try again.");
      setStatus("error");
    }
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processPdf(file);
  }

  const busy = status === "loading" || status === "working";
  const overall = totalPages > 0 ? (currentPage - 1 + pageProgress) / totalPages : 0;
  const outName = (fileName.replace(/\.pdf$/i, "") || "document") + "-searchable.pdf";

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="searchable-pdf-language">
          Text language
        </label>
        <select
          id="searchable-pdf-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={busy}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400">
          Pick the language the document is written in — it strongly affects accuracy.
        </p>
      </section>

      <section
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click(); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg className="mx-auto mb-4 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm font-medium text-slate-700">Drop a scanned PDF here, or click to browse</p>
        <p className="mt-1 text-xs text-slate-400">
          You get the same PDF back with selectable, searchable text — processed locally, up to {MAX_PAGES} pages
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processPdf(f); e.target.value = ""; }}
        />
      </section>

      {busy && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-800">
            {status === "loading"
              ? "Loading PDF and OCR engine… (language data is downloaded once, then cached)"
              : `Adding text layer to page ${currentPage} of ${totalPages}… ${Math.round(pageProgress * 100)}%`}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: status === "working" ? `${Math.round(overall * 100)}%` : "5%" }}
            />
          </div>
        </section>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">✗ {error}</p>
        </div>
      )}

      {status === "done" && resultUrl && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-sm font-semibold text-emerald-800">Searchable PDF ready</h3>
          <p className="mt-1 text-sm text-emerald-700">
            {totalPages} page{totalPages !== 1 ? "s" : ""} processed, {wordTotal.toLocaleString()} words placed in the invisible text layer
            {resultSize > 0 ? ` — ${(resultSize / 1024 / 1024).toFixed(2)} MB` : ""}.
          </p>
          {notice && <p className="mt-2 text-xs font-medium text-amber-700">{notice}</p>}
          {wordTotal === 0 && (
            <p className="mt-2 text-xs text-slate-600">
              No text was recognized — the download still works, but nothing will be selectable. Check the language setting and scan quality.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={resultUrl}
              download={outName}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              Download {outName}
            </a>
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 transition"
            >
              Preview in new tab
            </a>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Open the result and try selecting or searching (Ctrl/Cmd+F) the text. Selection follows the OCR result, so proofread anything you copy.
          </p>
        </section>
      )}
    </div>
  );
}
