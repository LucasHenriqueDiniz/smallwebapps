import { useState, useCallback } from "react";

interface MetaInfo {
  name: string;
  size: number;
  mime: string;
  lastModified: string;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: number;
  dateTaken?: string;
  camera?: string;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function readJpegExifDate(buffer: ArrayBuffer): { date?: string; camera?: string } {
  const view = new DataView(buffer);
  if (view.getUint16(0) !== 0xFFD8) return {};

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);
    const size = view.getUint16(offset + 2);
    if (marker === 0xFFE1) {
      // APP1 - might be EXIF
      const exifHeader = String.fromCharCode(
        view.getUint8(offset + 4), view.getUint8(offset + 5),
        view.getUint8(offset + 6), view.getUint8(offset + 7)
      );
      if (exifHeader === "Exif") {
        // Try to extract DateTimeOriginal — rough scan for ASCII date pattern
        const slice = new Uint8Array(buffer, offset + 10, size - 10);
        const text = Array.from(slice).map(c => String.fromCharCode(c)).join("");
        const dateMatch = text.match(/(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/);
        const cameraMatch = text.match(/([A-Z][a-zA-Z]+\0[^\0]{3,30})/);
        return {
          date: dateMatch ? dateMatch[1].replace(/:/g, "-").replace("-", ":").replace("-", ":") : undefined,
          camera: cameraMatch ? cameraMatch[0].replace(/\0/g, " ").trim() : undefined,
        };
      }
      break;
    }
    if (marker === 0xFFDA) break; // SOS — no more APP segments
    offset += 2 + size;
  }
  return {};
}

export default function ImageMetadataApp() {
  const [meta, setMeta] = useState<MetaInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const processFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const g = gcd(w, h);
      const mp = (w * h) / 1_000_000;

      const info: MetaInfo = {
        name: file.name,
        size: file.size,
        mime: file.type || "unknown",
        lastModified: new Date(file.lastModified).toLocaleString(),
        width: w,
        height: h,
        aspectRatio: `${w / g}:${h / g}`,
        megapixels: parseFloat(mp.toFixed(2)),
      };

      // Try EXIF for JPEG
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = readJpegExifDate(e.target?.result as ArrayBuffer);
          if (result.date) info.dateTaken = result.date;
          if (result.camera) info.camera = result.camera;
          setMeta({ ...info });
        };
        reader.readAsArrayBuffer(file.slice(0, 65536));
      } else {
        setMeta(info);
      }

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  function copyAll() {
    if (!meta) return;
    navigator.clipboard.writeText(JSON.stringify(meta, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  const fields = meta ? [
    { label: "File name", value: meta.name },
    { label: "File size", value: formatSize(meta.size) },
    { label: "MIME type", value: meta.mime },
    { label: "Dimensions", value: `${meta.width} × ${meta.height} px` },
    { label: "Aspect ratio", value: meta.aspectRatio },
    { label: "Megapixels", value: `${meta.megapixels} MP` },
    { label: "Last modified", value: meta.lastModified },
    ...(meta.dateTaken ? [{ label: "Date taken", value: meta.dateTaken }] : []),
    ...(meta.camera ? [{ label: "Camera info", value: meta.camera }] : []),
  ] : [];

  return (
    <div className="flex flex-col gap-5">
      <section
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = () => { const f = inp.files?.[0]; if (f) processFile(f); }; inp.click(); }}
      >
        <p className="text-sm font-medium text-slate-700">Drop an image or click to browse</p>
        <p className="mt-1 text-xs text-slate-400">JPEG, PNG, WebP, GIF, BMP supported</p>
      </section>

      {meta && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Metadata</h3>
            <button onClick={copyAll} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              {copied ? "✓ Copied JSON" : "Copy as JSON"}
            </button>
          </div>
          <dl className="divide-y divide-slate-100">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <dt className="text-sm font-medium text-slate-500">{label}</dt>
                <dd className="text-sm font-mono text-slate-800 break-all text-right max-w-xs">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
