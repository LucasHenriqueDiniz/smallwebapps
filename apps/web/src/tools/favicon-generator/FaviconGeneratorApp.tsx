import { useRef, useState } from "react";
import { zip } from "fflate";

const SIZES = [16, 32, 48, 64];

function renderImageToSize(img: HTMLImageElement, size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL("image/png");
}

function renderTextToSize(text: string, bgColor: string, textColor: string, size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(size * 0.55)}px sans-serif`;
  ctx.fillText(text.slice(0, 2), size / 2, size / 2);
  return canvas.toDataURL("image/png");
}

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

export default function FaviconGeneratorApp() {
  const [tab, setTab] = useState<"image" | "text">("image");

  // Image tab
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Text tab
  const [chars, setChars] = useState("🚀");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [textColor, setTextColor] = useState("#ffffff");

  const [copiedSnippet, setCopiedSnippet] = useState(false);

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    const img = new Image();
    img.onload = () => {
      const previews: Record<number, string> = {};
      for (const s of SIZES) previews[s] = renderImageToSize(img, s);
      setImagePreviews(previews);
    };
    img.src = url;
  }

  function downloadSingle(size: number) {
    const dataUrl = tab === "image" ? imagePreviews[size] : renderTextToSize(chars, bgColor, textColor, size);
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `favicon-${size}x${size}.png`;
    a.click();
  }

  function downloadAll() {
    const getDataUrl = (s: number) =>
      tab === "image" ? imagePreviews[s] : renderTextToSize(chars, bgColor, textColor, s);

    const files: Record<string, Uint8Array> = {};
    for (const s of SIZES) {
      const dataUrl = getDataUrl(s);
      if (dataUrl) files[`favicon-${s}x${s}.png`] = dataUrlToUint8(dataUrl);
    }

    zip(files, (err, data) => {
      if (err) return;
      const blob = new Blob([data], { type: "application/zip" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "favicons.zip";
      a.click();
    });
  }

  const textPreviews: Record<number, string> = {};
  for (const s of SIZES) {
    try {
      textPreviews[s] = renderTextToSize(chars, bgColor, textColor, s);
    } catch { /* skip */ }
  }

  const htmlSnippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`;

  function copySnippet() {
    navigator.clipboard.writeText(htmlSnippet).then(() => {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 1800);
    });
  }

  const previews = tab === "image" ? imagePreviews : textPreviews;
  const hasContent = tab === "image" ? !!imageSrc : !!chars;

  return (
    <div className="grid gap-5">
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 max-w-xs">
        {(["image", "text"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${t === tab ? "bg-white shadow text-slate-950" : "text-slate-500"}`}
          >
            {t === "image" ? "Upload image" : "Text/Emoji"}
          </button>
        ))}
      </div>

      {tab === "image" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:bg-slate-100 transition">
            Click to upload image
          </button>
        </section>
      )}

      {tab === "text" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Text/emoji settings</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Characters (1–2)</label>
              <input
                type="text"
                value={chars}
                onChange={(e) => setChars(e.target.value.slice(0, 2))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xl outline-none ring-2 ring-transparent focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Background color</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 cursor-pointer" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Text color</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 cursor-pointer" />
            </div>
          </div>
        </section>
      )}

      {hasContent && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Preview & download</h3>
          <div className="flex flex-wrap gap-6">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                {previews[size] && (
                  <img src={previews[size]} alt={`${size}x${size}`} width={size} height={size} className="rounded border border-slate-100" style={{ imageRendering: "pixelated" }} />
                )}
                <span className="text-xs text-slate-500">{size}×{size}</span>
                <button onClick={() => downloadSingle(size)} className="text-xs text-blue-600 hover:text-blue-700">↓ PNG</button>
              </div>
            ))}
          </div>
          <button onClick={downloadAll} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
            Download all as ZIP
          </button>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-950">HTML snippet</h3>
          <button onClick={copySnippet} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
            {copiedSnippet ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <pre className="rounded-xl bg-slate-950 px-4 py-3 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">{htmlSnippet}</pre>
      </section>
    </div>
  );
}
