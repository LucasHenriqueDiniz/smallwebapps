import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, Lock, Unlock } from "lucide-react";

export default function ImageResizeApp() {
  const [original, setOriginal] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [result, setResult] = useState<string | null>(null);
  const ratio = useRef(1);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginal({ url, w: img.naturalWidth, h: img.naturalHeight, name: file.name });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
      ratio.current = img.naturalWidth / img.naturalHeight;
      setResult(null);
    };
    img.src = url;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  function onWidthChange(val: string) {
    setWidth(val);
    if (locked && val) {
      const w = parseInt(val);
      if (!isNaN(w)) setHeight(String(Math.round(w / ratio.current)));
    }
  }

  function onHeightChange(val: string) {
    setHeight(val);
    if (locked && val) {
      const h = parseInt(val);
      if (!isNaN(h)) setWidth(String(Math.round(h * ratio.current)));
    }
  }

  function resize() {
    if (!original) return;
    const w = parseInt(width);
    const h = parseInt(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      setResult(canvas.toDataURL(`image/${format}`));
    };
    img.src = original.url;
  }

  function download() {
    if (!result || !original) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `${original.name.replace(/\.[^.]+$/, "")}-resized.${format}`;
    a.click();
  }

  return (
    <div className="flex flex-col gap-5">
      {!original ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Drop an image or click to browse</p>
          <p className="text-xs text-slate-500">JPG, PNG, WebP, GIF</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">Original</h3>
              <button onClick={() => { setOriginal(null); setResult(null); }} className="text-xs text-slate-400 hover:text-slate-600">Change</button>
            </div>
            <img src={original.url} alt="Original" className="w-full rounded-xl object-contain max-h-56" />
            <p className="mt-2 text-xs text-slate-500">{original.w} × {original.h} px</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-950">Settings</h3>

            <div className="mb-4 flex items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => onWidthChange(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 outline-none"
                />
              </div>
              <button onClick={() => setLocked(!locked)} className="mb-0.5 p-1.5 text-slate-400 hover:text-slate-700 transition">
                {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => onHeightChange(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              {(["png", "jpeg"] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${format === f ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            <button onClick={resize} className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              Resize
            </button>

            {result && (
              <div className="mt-4">
                <img src={result} alt="Resized" className="w-full rounded-xl object-contain max-h-40 mb-3" />
                <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                  <Download className="h-4 w-4" /> Download {format.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
