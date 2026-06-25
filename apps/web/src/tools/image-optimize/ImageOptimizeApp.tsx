import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, ArrowRight } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface Props {
  initialMaxSizeMB?: number;
}

export default function ImageOptimizeApp({ initialMaxSizeMB = 1 }: Props) {
  const [original, setOriginal] = useState<{ url: string; size: number; name: string } | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxSizeMB, setMaxSizeMB] = useState(initialMaxSizeMB);
  const [result, setResult] = useState<{ url: string; size: number; blob: Blob } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setOriginal({ url: URL.createObjectURL(file), size: file.size, name: file.name });
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    multiple: false,
  });

  async function optimize() {
    if (!original) return;
    setLoading(true);
    setError("");
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const response = await fetch(original.url);
      const blob = await response.blob();
      const file = new File([blob], original.name, { type: blob.type });
      const compressed = await imageCompression(file, {
        maxSizeMB,
        initialQuality: quality / 100,
        useWebWorker: true,
      });
      const url = URL.createObjectURL(compressed);
      setResult({ url, size: compressed.size, blob: compressed });
    } catch {
      setError("Optimization failed. Try a different image.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!result || !original) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${original.name.replace(/\.[^.]+$/, "")}-optimized${original.name.match(/\.[^.]+$/)?.[0] ?? ".jpg"}`;
    a.click();
  }

  const saving = original && result ? Math.round((1 - result.size / original.size) * 100) : null;

  return (
    <div className="flex flex-col gap-5">
      {!original ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Drop a JPG or PNG or click to browse</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">Preview</h3>
              <button onClick={() => { setOriginal(null); setResult(null); }} className="text-xs text-slate-400 hover:text-slate-600">Change</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">Original</p>
                <img src={original.url} alt="Original" className="w-full rounded-xl object-contain max-h-48" />
                <p className="mt-1 text-xs text-slate-500">{formatBytes(original.size)}</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  Optimized {saving !== null && <span className="text-emerald-600 font-semibold">−{saving}%</span>}
                </p>
                {result ? (
                  <>
                    <img src={result.url} alt="Optimized" className="w-full rounded-xl object-contain max-h-48" />
                    <p className="mt-1 text-xs text-slate-500">{formatBytes(result.size)}</p>
                  </>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                    Click optimize
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-950">Settings</h3>

            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <label>Quality</label>
                <span className="font-medium text-slate-700">{quality}%</span>
              </div>
              <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>

            <div className="mb-5">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <label>Max size</label>
                <span className="font-medium text-slate-700">{maxSizeMB < 1 ? `${Math.round(maxSizeMB * 1024)} KB` : `${maxSizeMB} MB`}</span>
              </div>
              <input type="range" min={0.02} max={10} step={0.01} value={maxSizeMB} onChange={(e) => setMaxSizeMB(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <button onClick={optimize} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              <ArrowRight className="h-4 w-4" /> {loading ? "Optimizing…" : "Optimize"}
            </button>

            {result && (
              <button onClick={download} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                <Download className="h-4 w-4" /> Download
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
