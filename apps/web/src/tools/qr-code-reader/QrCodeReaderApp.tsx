import { useState, useRef, useCallback } from "react";

export default function QrCodeReaderApp() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File) => {
    setResult("");
    setError("");
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const jsQR = (await import("jsqr")).default;
      const code = jsQR(imageData.data, img.width, img.height);
      if (code) {
        setResult(code.data);
      } else {
        setError("No QR code found in this image.");
      }
    };
    img.onerror = () => { setError("Could not load image."); };
    img.src = url;
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }

  async function onPaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) { processImage(file); return; }
      }
    }
    setError("No image found in clipboard.");
  }

  const isUrl = result && (result.startsWith("http://") || result.startsWith("https://"));

  return (
    <div className="flex flex-col gap-5">
      <canvas ref={canvasRef} className="hidden" />

      <section
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
        }`}
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
        <p className="text-sm font-medium text-slate-700">Drop an image here, click to browse, or paste from clipboard</p>
        <p className="mt-1 text-xs text-slate-400">PNG, JPG, WebP, GIF supported</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processImage(f); }}
        />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">✗ {error}</p>
        </div>
      )}

      {result && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-emerald-800">QR Code Decoded</h3>
          {isUrl ? (
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm font-medium text-blue-600 hover:underline"
            >
              {result}
            </a>
          ) : (
            <p className="break-all text-sm font-mono text-slate-800">{result}</p>
          )}
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            className="mt-3 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 transition"
          >
            Copy text
          </button>
        </section>
      )}
    </div>
  );
}
