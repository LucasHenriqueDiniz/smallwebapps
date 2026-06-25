import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, Crop } from "lucide-react";

const PRESETS = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:2", ratio: 3 / 2 },
];

export default function ImageCropApp() {
  const [original, setOriginal] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [preset, setPreset] = useState<number | null>(null);
  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginal({ url, w: img.naturalWidth, h: img.naturalHeight, name: file.name });
      setX("0"); setY("0");
      setW(String(img.naturalWidth));
      setH(String(img.naturalHeight));
      setPreset(null);
      setResult(null);
    };
    img.src = url;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, multiple: false });

  function applyPreset(ratio: number | null) {
    setPreset(ratio);
    if (!original || ratio === null) return;
    const newW = original.w;
    const newH = Math.round(newW / ratio);
    setX("0"); setY("0");
    setW(String(newW));
    setH(String(Math.min(newH, original.h)));
  }

  function crop() {
    if (!original) return;
    const cx = parseInt(x), cy = parseInt(y), cw = parseInt(w), ch = parseInt(h);
    if ([cx, cy, cw, ch].some(isNaN) || cw <= 0 || ch <= 0) {
      setError("Enter valid positive numbers for all fields."); return;
    }
    if (cx + cw > original.w || cy + ch > original.h) {
      setError("Crop area exceeds image bounds."); return;
    }
    setError("");
    const canvas = document.createElement("canvas");
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
      setResult(canvas.toDataURL("image/png"));
    };
    img.src = original.url;
  }

  function download() {
    if (!result || !original) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `${original.name.replace(/\.[^.]+$/, "")}-cropped.png`;
    a.click();
  }

  return (
    <div className="flex flex-col gap-5">
      {!original ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Drop an image or click to browse</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">Original · {original.w}×{original.h}</h3>
              <button onClick={() => { setOriginal(null); setResult(null); }} className="text-xs text-slate-400 hover:text-slate-600">Change</button>
            </div>
            <img src={original.url} alt="Original" className="w-full rounded-xl object-contain max-h-64" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-950">Crop settings</h3>

            <div className="mb-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => applyPreset(p.ratio)} className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${preset === p.ratio ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[["X offset", x, setX], ["Y offset", y, setY], ["Width", w, setW], ["Height", h, setH]].map(([label, val, setter]) => (
                <div key={label as string} className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">{label as string} (px)</label>
                  <input
                    type="number"
                    value={val as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 outline-none"
                  />
                </div>
              ))}
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <button onClick={crop} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              <Crop className="h-4 w-4" /> Crop image
            </button>

            {result && (
              <div className="mt-4">
                <img src={result} alt="Cropped" className="w-full rounded-xl object-contain max-h-40 mb-3" />
                <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                  <Download className="h-4 w-4" /> Download PNG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
