import { useRef, useState } from "react";

export default function ImageFormatConverterApp() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/webp");
  const [quality, setQuality] = useState(85);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalName(file.name);
    setOriginalSize(file.size);
    setOutputUrl(null);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  }

  function handleConvert() {
    if (!imageSrc || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const q = format === "image/png" ? 1 : quality / 100;
      const dataUrl = canvas.toDataURL(format, q);
      setOutputUrl(dataUrl);
      // Estimate size
      const base64 = dataUrl.split(",")[1];
      setOutputSize(Math.round(base64.length * 0.75));
    };
    img.src = imageSrc;
  }

  function handleDownload() {
    if (!outputUrl) return;
    const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    const baseName = originalName.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${baseName}.${ext}`;
    a.click();
  }

  const formatLabel = format === "image/png" ? "PNG" : format === "image/jpeg" ? "JPG" : "WebP";

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Upload image</h3>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-6 text-sm text-slate-500 hover:bg-slate-100 transition"
        >
          {imageSrc ? originalName : "Click or drag to upload image…"}
        </button>
        {imageSrc && <img src={imageSrc} alt="preview" className="mt-3 max-h-48 rounded-xl object-contain w-full border border-slate-100" />}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Output format</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {([
            { label: "PNG", value: "image/png" as const },
            { label: "JPG", value: "image/jpeg" as const },
            { label: "WebP", value: "image/webp" as const },
          ] as const).map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFormat(value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${format === value ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {format !== "image/png" && (
          <div className="mb-4">
            <label className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
              <span>Quality</span>
              <span>{quality}%</span>
            </label>
            <input type="range" min={60} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleConvert}
            disabled={!imageSrc}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
          >
            Convert to {formatLabel}
          </button>
          {outputUrl && (
            <button onClick={handleDownload} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Download
            </button>
          )}
        </div>

        {outputUrl && (
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span>Original: {(originalSize / 1024).toFixed(1)} KB</span>
            <span>Estimated output: {(outputSize / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </section>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
