import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, ImageIcon } from "lucide-react";

export default function PdfToImageApp() {
  const [images, setImages] = useState<{ url: string; page: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [scale, setScale] = useState(2);

  const convert = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    setImages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotal(pdf.numPages);
      const results: { url: string; page: number }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(i);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        results.push({ url: canvas.toDataURL("image/png"), page: i });
      }
      setImages(results);
    } catch (e) {
      setError("Failed to convert PDF. The file may be corrupted or password-protected.");
    } finally {
      setLoading(false);
    }
  }, [scale]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && convert(files[0]),
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  function download(url: string, page: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `page-${page}.png`;
    a.click();
  }

  function downloadAll() {
    images.forEach(({ url, page }) => download(url, page));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium text-slate-600">Scale</label>
        {[1, 1.5, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${
              scale === s
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s}×
          </button>
        ))}
        <span className="text-xs text-slate-400">Higher = sharper, slower</span>
      </div>

      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">
          {isDragActive ? "Drop the PDF here" : "Drop a PDF or click to browse"}
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Rendering pages…</span>
            <span>{progress} / {total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: total ? `${(progress / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {images.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">{images.length} page{images.length !== 1 ? "s" : ""} converted</h3>
            {images.length > 1 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <Download className="h-3.5 w-3.5" /> Download all
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map(({ url, page }) => (
              <div key={page} className="group relative overflow-hidden rounded-xl border border-slate-200">
                <img src={url} alt={`Page ${page}`} className="w-full object-contain" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-xs font-medium text-white">Page {page}</span>
                  <button
                    onClick={() => download(url, page)}
                    className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-xs text-white backdrop-blur hover:bg-white/30"
                  >
                    <Download className="h-3 w-3" /> PNG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
