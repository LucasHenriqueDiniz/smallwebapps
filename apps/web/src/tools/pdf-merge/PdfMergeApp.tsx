import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

interface PdfFile {
  id: number;
  name: string;
  data: ArrayBuffer;
  pageCount?: number;
}

let nextId = 1;

export default function PdfMergeApp() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const added = Array.from(e.target.files ?? []);
    const newFiles: PdfFile[] = [];
    for (const f of added) {
      const data = await f.arrayBuffer();
      let pageCount: number | undefined;
      try {
        const doc = await PDFDocument.load(data, { ignoreEncryption: true });
        pageCount = doc.getPageCount();
      } catch { /* ignore */ }
      newFiles.push({ id: nextId++, name: f.name, data, pageCount });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function moveUp(i: number) {
    if (i === 0) return;
    setFiles((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  }

  function moveDown(i: number) {
    setFiles((prev) => {
      if (i >= prev.length - 1) return prev;
      const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a;
    });
  }

  function remove(id: number) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleMerge() {
    if (files.length < 1) return;
    setMerging(true);
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const doc = await PDFDocument.load(f.data, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "merged.pdf";
      a.click();
    } finally {
      setMerging(false);
    }
  }

  const totalPages = files.reduce((s, f) => s + (f.pageCount ?? 0), 0);

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Upload PDF files</h3>
        <input ref={fileRef} type="file" accept="application/pdf" multiple onChange={handleFiles} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:bg-slate-100 transition">
          Click to add PDF files (you can add multiple)
        </button>
      </section>

      {files.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Files ({files.length} • {totalPages} pages estimated)</h3>
          </div>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <span className="text-xs text-slate-400 w-5 text-center">{i + 1}</span>
                <span className="flex-1 text-sm text-slate-800 truncate">{f.name}</span>
                {f.pageCount && <span className="text-xs text-slate-400">{f.pageCount}p</span>}
                <button onClick={() => moveUp(i)} disabled={i === 0} className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30">↑</button>
                <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30">↓</button>
                <button onClick={() => remove(f.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>
          <button
            onClick={handleMerge}
            disabled={merging || files.length < 1}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
          >
            {merging ? "Merging…" : "Merge & Download"}
          </button>
        </section>
      )}
    </div>
  );
}
