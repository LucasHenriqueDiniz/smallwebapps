import { useRef, useState } from "react";

interface MetaRow {
  label: string;
  value: string;
}

function formatPdfDate(raw: string) {
  const m = raw.replace("D:", "").match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!m) return raw;
  try {
    return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`).toLocaleString();
  } catch { return raw; }
}

export default function PdfMetadataApp() {
  const [rows, setRows] = useState<MetaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    try {
      // Dynamic import to avoid SSR issues with pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const buf = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buf });
      const doc = await loadingTask.promise;
      const meta = await doc.getMetadata();
      const info = (meta.info ?? {}) as Record<string, unknown>;
      const pageCount = doc.numPages;

      const result: MetaRow[] = [
        { label: "File name", value: file.name },
        { label: "File size", value: `${(file.size / 1024).toFixed(1)} KB` },
        { label: "Page count", value: String(pageCount) },
        { label: "Title", value: String(info["Title"] ?? "—") },
        { label: "Author", value: String(info["Author"] ?? "—") },
        { label: "Subject", value: String(info["Subject"] ?? "—") },
        { label: "Creator", value: String(info["Creator"] ?? "—") },
        { label: "Producer", value: String(info["Producer"] ?? "—") },
        { label: "PDF Version", value: String(info["PDFFormatVersion"] ?? "—") },
        { label: "Creation date", value: info["CreationDate"] ? formatPdfDate(String(info["CreationDate"])) : "—" },
        { label: "Modification date", value: info["ModDate"] ? formatPdfDate(String(info["ModDate"])) : "—" },
      ];
      setRows(result);
    } catch (err) {
      setRows([{ label: "Error", value: err instanceof Error ? err.message : "Failed to read PDF" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Upload PDF</h3>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:bg-slate-100 transition">
          {loading ? "Reading…" : (fileName || "Click to upload a PDF")}
        </button>
      </section>

      {rows.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Metadata</h3>
          <div className="space-y-2">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="w-40 shrink-0 text-xs font-medium text-slate-500">{label}</span>
                <span className="flex-1 text-sm text-slate-800 break-all">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
