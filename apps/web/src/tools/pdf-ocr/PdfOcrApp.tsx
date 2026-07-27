import { useState, useRef, useCallback } from "react";

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "por", label: "Portuguese" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "nld", label: "Dutch" },
  { code: "pol", label: "Polish" },
  { code: "tur", label: "Turkish" },
  { code: "rus", label: "Russian" },
  { code: "jpn", label: "Japanese" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
];

const MAX_PAGES = 50;

type Status = "idle" | "loading" | "working" | "done" | "error";

export default function PdfOcrApp() {
  const [language, setLanguage] = useState("eng");
  const [status, setStatus] = useState<Status>("idle");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageProgress, setPageProgress] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
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
    setText("");
    setCopied(false);
    setFileName(file.name);
    setCurrentPage(0);
    setTotalPages(0);
    setPageProgress(0);
    setStatus("loading");
    try {
      const [pdfjsLib, { createWorker }] = await Promise.all([
        import("pdfjs-dist"),
        import("tesseract.js"),
      ]);
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = Math.min(pdf.numPages, MAX_PAGES);
      if (pdf.numPages > MAX_PAGES) {
        setNotice(`This PDF has ${pdf.numPages} pages; only the first ${MAX_PAGES} are processed. Split the PDF to handle the rest.`);
      }
      setTotalPages(pageCount);

      const worker = await createWorker(languageRef.current, 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setPageProgress(m.progress);
        },
      });
      try {
        const parts: string[] = [];
        for (let i = 1; i <= pageCount; i++) {
          setCurrentPage(i);
          setPageProgress(0);
          setStatus("working");
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const { data } = await worker.recognize(canvas);
          const pageText = data.text.trim();
          parts.push(pageCount > 1 ? `--- Page ${i} ---\n${pageText}` : pageText);
          canvas.width = 0;
          canvas.height = 0;
        }
        setText(parts.join("\n\n").trim());
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

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadText() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName.replace(/\.pdf$/i, "") || "extracted-text") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const busy = status === "loading" || status === "working";
  const overall = totalPages > 0 ? (currentPage - 1 + pageProgress) / totalPages : 0;
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="pdf-ocr-language">
          Text language
        </label>
        <select
          id="pdf-ocr-language"
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
        <p className="mt-1 text-xs text-slate-400">Each page is rendered and recognized locally — up to {MAX_PAGES} pages</p>
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
              : `Recognizing page ${currentPage} of ${totalPages}… ${Math.round(pageProgress * 100)}%`}
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

      {status === "done" && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-emerald-800">
              Extracted text{" "}
              <span className="font-normal text-emerald-700">
                ({totalPages} page{totalPages !== 1 ? "s" : ""}{wordCount > 0 ? `, ${wordCount} words` : ""})
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyText}
                disabled={!text}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 transition disabled:opacity-50"
              >
                {copied ? "Copied ✓" : "Copy text"}
              </button>
              <button
                onClick={downloadText}
                disabled={!text}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 transition disabled:opacity-50"
              >
                Download .txt
              </button>
            </div>
          </div>
          {notice && <p className="mb-3 text-xs font-medium text-amber-700">{notice}</p>}
          {text ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={18}
              className="w-full rounded-lg border border-emerald-200 bg-white p-3 text-sm font-mono text-slate-800"
              aria-label="Extracted text (editable)"
            />
          ) : (
            <p className="text-sm text-slate-600">
              No text was detected in this PDF. If the scan is faint or skewed, try a cleaner scan — and double-check the language setting.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
