import { useRef, useState } from "react";
import { degrees, PDFDocument, rgb } from "pdf-lib";

function hexToRgbLib(hex: string): ReturnType<typeof rgb> {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

export default function PdfWatermarkApp() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(30);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState("#000000");
  const [position, setPosition] = useState<"center" | "diagonal">("diagonal");
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setPdfData(await file.arrayBuffer());
  }

  async function handleApply() {
    if (!pdfData || !watermarkText) return;
    setProcessing(true);
    try {
      const doc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
      const pages = doc.getPages();
      const colorVal = hexToRgbLib(color);

      for (const page of pages) {
        const { width, height } = page.getSize();
        const x = position === "center" ? width / 2 : width / 2;
        const y = position === "center" ? height / 2 : height / 2;

        page.drawText(watermarkText, {
          x: x - (watermarkText.length * fontSize * 0.3),
          y,
          size: fontSize,
          opacity: opacity / 100,
          rotate: degrees(rotation),
          color: colorVal,
        });
      }

      const bytes = await doc.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName.replace(/\.pdf$/i, "-watermarked.pdf");
      a.click();
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">PDF file</h3>
          <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500 hover:bg-slate-100 transition">
            {pdfData ? fileName : "Click to upload a PDF"}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Watermark settings</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Text</label>
              <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                <span>Font size</span><span>{fontSize}pt</span>
              </label>
              <input type="range" min={12} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                <span>Opacity</span><span>{opacity}%</span>
              </label>
              <input type="range" min={10} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                <span>Rotation</span><span>{rotation}°</span>
              </label>
              <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer" />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Preview</h3>
        <div
          className="flex-1 min-h-48 rounded-xl border border-slate-200 bg-white flex items-center justify-center relative overflow-hidden"
          style={{ background: "#f8fafc" }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span
              style={{
                fontSize: Math.max(16, fontSize * 0.5),
                opacity: opacity / 100,
                color,
                transform: `rotate(${rotation}deg)`,
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {watermarkText || "WATERMARK"}
            </span>
          </div>
          <div className="z-10 text-center text-slate-400">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-sm">PDF preview</div>
          </div>
        </div>
        <button
          onClick={handleApply}
          disabled={!pdfData || processing || !watermarkText}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
        >
          {processing ? "Applying…" : "Apply & Download"}
        </button>
      </section>
    </div>
  );
}
