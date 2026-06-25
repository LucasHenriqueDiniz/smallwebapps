import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Copy, Check, Upload } from "lucide-react";

export default function PdfExtractTextApp() {
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");

  const extractText = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    setText("");
    setFileName(file.name);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPages(pdf.numPages);
      const parts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");
        parts.push(`--- Page ${i} ---\n${pageText}`);
      }
      setText(parts.join("\n\n"));
    } catch (e) {
      setError("Could not extract text. Make sure this is a searchable PDF (not a scanned image).");
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) extractText(accepted[0]);
  }, [extractText]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {isDragActive ? "Drop the PDF here" : "Drop a PDF or click to browse"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Searchable PDFs only — scanned images won't work</p>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Extracting text…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {text && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{fileName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{pages} page{pages !== 1 ? "s" : ""} · {text.length.toLocaleString()} characters</p>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>
          <textarea
            readOnly
            value={text}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 outline-none"
            style={{ minHeight: "320px", resize: "vertical" }}
          />
        </div>
      )}
    </div>
  );
}
