import { useRef, useState } from "react";

export default function ImageFlipRotateApp() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState("image");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Track cumulative transforms
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  function renderCanvas(src: string, rot: number, fh: boolean, fv: boolean) {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const absRot = ((rot % 360) + 360) % 360;
      const swapped = absRot === 90 || absRot === 270;
      canvas.width = swapped ? img.naturalHeight : img.naturalWidth;
      canvas.height = swapped ? img.naturalWidth : img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((absRot * Math.PI) / 180);
      ctx.scale(fh ? -1 : 1, fv ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
      setPreviewSrc(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalName(file.name.replace(/\.[^.]+$/, ""));
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setRotation(0); setFlipH(false); setFlipV(false);
    renderCanvas(url, 0, false, false);
  }

  function applyFlipH() {
    const newFH = !flipH;
    setFlipH(newFH);
    if (imageSrc) renderCanvas(imageSrc, rotation, newFH, flipV);
  }

  function applyFlipV() {
    const newFV = !flipV;
    setFlipV(newFV);
    if (imageSrc) renderCanvas(imageSrc, rotation, flipH, newFV);
  }

  function applyRotate(delta: number) {
    const newRot = rotation + delta;
    setRotation(newRot);
    if (imageSrc) renderCanvas(imageSrc, newRot, flipH, flipV);
  }

  function handleDownload() {
    if (!previewSrc) return;
    const a = document.createElement("a");
    a.href = previewSrc;
    a.download = `${originalName}-edited.png`;
    a.click();
  }

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
              {[
                { label: "Flip Horizontal", fn: applyFlipH },
                { label: "Flip Vertical", fn: applyFlipV },
                { label: "Rotate 90° CW", fn: () => applyRotate(90) },
                { label: "Rotate 90° CCW", fn: () => applyRotate(-90) },
                { label: "Rotate 180°", fn: () => applyRotate(180) },
              ].map(({ label, fn }) => (
                <button key={label} onClick={fn} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  {label}
                </button>
              ))}
            </div>
            {previewSrc && <img src={previewSrc} alt="preview" className="max-h-80 rounded-xl object-contain w-full border border-slate-100" />}
          </section>

          <button onClick={handleDownload} disabled={!previewSrc} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition self-start disabled:opacity-40">
            Download PNG
          </button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
