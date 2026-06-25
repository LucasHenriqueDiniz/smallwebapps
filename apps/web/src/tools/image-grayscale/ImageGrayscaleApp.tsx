import { useRef, useState } from "react";

type Filter = "none" | "grayscale" | "sepia" | "invert" | "contrast";

const FILTERS: { key: Filter; label: string; css: string }[] = [
  { key: "none", label: "Original", css: "none" },
  { key: "grayscale", label: "Grayscale", css: "grayscale(100%)" },
  { key: "sepia", label: "Sepia", css: "sepia(100%)" },
  { key: "invert", label: "Invert", css: "invert(100%)" },
  { key: "contrast", label: "High Contrast", css: "contrast(200%)" },
];

export default function ImageGrayscaleApp() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState("image");
  const [activeFilter, setActiveFilter] = useState<Filter>("none");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalName(file.name.replace(/\.[^.]+$/, ""));
    setImageSrc(URL.createObjectURL(file));
    setActiveFilter("none");
  }

  function handleDownload() {
    if (!imageSrc || !canvasRef.current) return;
    const filter = FILTERS.find((f) => f.key === activeFilter)!;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = filter.css;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${originalName}-${activeFilter}.png`;
      a.click();
    };
    img.src = imageSrc;
  }

  const filterCss = FILTERS.find((f) => f.key === activeFilter)?.css ?? "none";

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:bg-slate-100 transition">
          Click to upload image
        </button>
      </section>

      {imageSrc && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${key === activeFilter ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <img
              src={imageSrc}
              alt="preview"
              style={{ filter: filterCss }}
              className="max-h-80 w-full rounded-xl object-contain border border-slate-100"
            />
          </section>

          <button
            onClick={handleDownload}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition self-start"
          >
            Download PNG
          </button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
