import { useState, useRef, useEffect } from "react";

export default function QrCodeGeneratorApp() {
  const [text, setText] = useState("https://smallwebapps.com");
  const [size, setSize] = useState(256);
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.default.toCanvas(canvasRef.current, text, {
        width: size,
        errorCorrectionLevel: ecLevel,
        margin: 2,
      }).then(() => {
        if (!cancelled) setError("");
      }).catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    });
    return () => { cancelled = true; };
  }, [text, size, ecLevel]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "qr-code.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function downloadSvg() {
    const QRCode = await import("qrcode");
    try {
      const svg = await QRCode.default.toString(text, {
        type: "svg",
        width: size,
        errorCorrectionLevel: ecLevel,
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.download = "qr-code.svg";
      a.href = URL.createObjectURL(blob);
      a.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function copyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch {
        // fallback: do nothing silently
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Settings</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Text or URL</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
            >
              <option value={128}>128 × 128 px</option>
              <option value={256}>256 × 256 px</option>
              <option value={512}>512 × 512 px</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Error Correction</label>
            <select
              value={ecLevel}
              onChange={(e) => setEcLevel(e.target.value as "L" | "M" | "Q" | "H")}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
            >
              <option value="L">L — Low (7%)</option>
              <option value="M">M — Medium (15%)</option>
              <option value="Q">Q — Quartile (25%)</option>
              <option value="H">H — High (30%)</option>
            </select>
          </div>

          {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={downloadPng} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              Download PNG
            </button>
            <button onClick={downloadSvg} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              Download SVG
            </button>
            <button onClick={copyImage} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              Copy Image
            </button>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
        <canvas ref={canvasRef} className="rounded-xl" />
      </section>
    </div>
  );
}
