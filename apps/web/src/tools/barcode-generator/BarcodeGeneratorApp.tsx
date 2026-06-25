import { useState, useRef, useEffect } from "react";

const FORMATS = ["CODE128", "EAN13", "EAN8", "UPC", "CODE39", "ITF14"];

export default function BarcodeGeneratorApp() {
  const [text, setText] = useState("012345678905");
  const [format, setFormat] = useState("CODE128");
  const [lineWidth, setLineWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [fontSize, setFontSize] = useState(20);
  const [error, setError] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!text.trim() || !svgRef.current) return;
    import("jsbarcode").then((mod) => {
      const JsBarcode = mod.default;
      try {
        JsBarcode(svgRef.current, text, {
          format,
          lineColor: "#000000",
          width: lineWidth,
          height,
          fontSize,
          displayValue: true,
          margin: 10,
        });
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid barcode input");
      }
    });
  }, [text, format, lineWidth, height, fontSize]);

  function downloadSvg() {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.download = "barcode.svg";
    a.href = URL.createObjectURL(blob);
    a.click();
  }

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const bbox = svg.getBoundingClientRect();
    canvas.width = bbox.width * 2;
    canvas.height = bbox.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    const svgBlob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = "barcode.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = URL.createObjectURL(svgBlob);
  }

  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:w-72 shrink-0">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Settings</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Text / Number</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Bar Width: {lineWidth}px</label>
            <input type="range" min={1} max={4} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Height: {height}px</label>
            <input type="range" min={40} max={200} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Font Size: {fontSize}px</label>
            <input type="range" min={8} max={32} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
          </div>

          {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={downloadSvg} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              SVG
            </button>
            <button onClick={downloadPng} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              PNG
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
        <svg ref={svgRef} />
      </section>
    </div>
  );
}
