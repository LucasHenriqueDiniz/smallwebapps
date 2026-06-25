import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileDown, GripVertical } from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  name: string;
  file: File;
}

export default function ImageToPdfApp() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    const items: ImageItem[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));
    setImages((prev) => [...prev, ...items]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
  });

  function remove(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  async function generate() {
    if (!images.length) return;
    setLoading(true);
    setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const firstImg = await loadImage(images[0].url);
      const orientation = firstImg.naturalWidth > firstImg.naturalHeight ? "l" : "p";
      const pdf = new jsPDF({ orientation, unit: "px", format: [firstImg.naturalWidth, firstImg.naturalHeight] });
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        const img = await loadImage(images[i].url);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        pdf.internal.pageSize.width = w;
        pdf.internal.pageSize.height = h;
        pdf.addImage(img, "JPEG", 0, 0, w, h);
      }
      pdf.save("images.pdf");
    } catch (e) {
      setError("Failed to generate PDF. Try with JPG or PNG images.");
    } finally {
      setLoading(false);
    }
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-7 w-7 text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">
          {isDragActive ? "Drop images here" : "Drop images or click to browse"}
        </p>
        <p className="text-xs text-slate-500">JPG, PNG, WebP · Add multiple</p>
      </div>

      {images.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-950">{images.length} image{images.length !== 1 ? "s" : ""} · one page each</h3>
          <div className="flex flex-col gap-2">
            {images.map((img) => (
              <div key={img.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <GripVertical className="h-4 w-4 flex-shrink-0 text-slate-300" />
                <img src={img.url} alt={img.name} className="h-10 w-10 flex-shrink-0 rounded object-cover" />
                <span className="flex-1 truncate text-xs text-slate-700">{img.name}</span>
                <button onClick={() => remove(img.id)} className="text-slate-400 hover:text-red-500 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <FileDown className="h-4 w-4" />
            {loading ? "Generating…" : "Generate PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
