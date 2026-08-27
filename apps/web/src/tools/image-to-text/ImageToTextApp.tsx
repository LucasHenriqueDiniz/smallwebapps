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

type Status = "idle" | "loading-engine" | "recognizing" | "done" | "error";

interface Props {
  /** Restrict the file picker, e.g. "image/jpeg" for the JPG variant. Defaults to any image. */
  accept?: string;
  /** Label shown in the drop-zone hint, e.g. "JPG" or "screenshot". Defaults to generic image wording. */
  sourceLabel?: string;
}

export default function ImageToTextApp({ accept = "image/*", sourceLabel }: Props = {}) {
  const [language, setLanguage] = useState("eng");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef(language);
  languageRef.current = language;

  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP, BMP).");
      setStatus("error");
      return;
    }
    setError("");
    setText("");
    setCopied(false);
    setProgress(0);
    setFileName(file.name);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setStatus("loading-engine");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(languageRef.current, 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatus("recognizing");
            setProgress(m.progress);
          }
        },
      });
      try {
        const { data } = await worker.recognize(file);
        setText(data.text.trim());
        setStatus("done");
      } finally {
        await worker.terminate();
      }
    } catch {
      setError("Text recognition failed. Try a different image, or reload the page and try again.");
      setStatus("error");
    }
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }

  function onPaste(e: React.ClipboardEvent) {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) { processImage(file); return; }
      }
    }
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
    a.download = (fileName.replace(/\.[^.]+$/, "") || "extracted-text") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const busy = status === "loading-engine" || status === "recognizing";
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="ocr-language">
          Step 1 — Choose the text language
        </label>
        <p className="mb-3 text-xs text-slate-500">
          Pick the language the text is written in — it strongly affects accuracy.
        </p>
        <select
          id="ocr-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={busy}
          className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </section>

      <section
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click(); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg className="mx-auto mb-4 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18M3 12V4.5A.75.75 0 013.75 3.75h16.5A.75.75 0 0121 4.5V12" />
        </svg>
        <p className="text-sm font-medium text-slate-700">
          Drop {sourceLabel ? `a ${sourceLabel}` : "an image"} here, click to browse, or paste from clipboard
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {accept === "image/*" ? "PNG, JPG, WebP, BMP supported — best" : "Best"} results with clear printed text
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processImage(f); e.target.value = ""; }}
        />
      </section>

      {busy && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-800">
            {status === "loading-engine"
              ? "Loading OCR engine and language data… (downloaded once, then cached)"
              : `Recognizing text… ${Math.round(progress * 100)}%`}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: status === "recognizing" ? `${Math.round(progress * 100)}%` : "10%" }}
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
              Extracted text {wordCount > 0 && <span className="font-normal text-emerald-700">({wordCount} words)</span>}
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
          {text ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={Math.min(18, Math.max(6, text.split("\n").length + 1))}
              className="w-full rounded-lg border border-emerald-200 bg-white p-3 text-sm font-mono text-slate-800"
              aria-label="Extracted text (editable)"
            />
          ) : (
            <p className="text-sm text-slate-600">
              No text was detected in this image. Try a sharper image, a tighter crop around the text, or a different language setting.
            </p>
          )}
          {previewUrl && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-emerald-800">Show source image</summary>
              <img src={previewUrl} alt="Source for text extraction" className="mt-2 max-h-80 max-w-full rounded-lg border border-emerald-200" />
            </details>
          )}
        </section>
      )}
    </div>
  );
}
