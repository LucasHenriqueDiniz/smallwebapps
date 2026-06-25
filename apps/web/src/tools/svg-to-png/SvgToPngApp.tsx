import { useState, useRef, useCallback } from "react";

export default function SvgToPngApp() {
  const [svgCode, setSvgCode] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#3b82f6"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">SVG</text>
</svg>`);
  const [scale, setScale] = useState(2);
  const [bg, setBg] = useState<"transparent" | "white">("white");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback((code: string, s: number, background: string) => {
    const blob = new Blob([code], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) { URL.revokeObjectURL(url); return; }
      canvas.width = img.width * s || 256 * s;
      canvas.height = img.height * s || 256 * s;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (background === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setPreviewUrl(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, []);

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const code = e.target?.result as string;
      setSvgCode(code);
      render(code, scale, bg);
    };
    reader.readAsText(file);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "converted.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <div className="flex flex-col gap-5">
      <canvas ref={canvasRef} className="hidden" />

      <section
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".svg,image/svg+xml"; inp.onchange = () => { const f = inp.files?.[0]; if (f) processFile(f); }; inp.click(); }}
      >
        <p className="text-sm font-medium text-slate-700">Drop an SVG file or click to browse</p>
      </section>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Scale</label>
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={3}>3×</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Background</label>
          <select value={bg} onChange={(e) => setBg(e.target.value as "transparent" | "white")} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <option value="white">White</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>
        <button
          onClick={() => render(svgCode, scale, bg)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Convert
        </button>
        {previewUrl && (
          <button onClick={download} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            Download PNG
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">SVG Code</h3>
          <textarea
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            className="min-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Preview</h3>
          {previewUrl ? (
            <img src={previewUrl} alt="PNG preview" className="max-h-64 rounded-xl object-contain mx-auto" style={{ background: bg === "transparent" ? "repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 20px 20px" : "white" }} />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">Click Convert to see preview</div>
          )}
        </section>
      </div>
    </div>
  );
}
