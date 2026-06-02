import { useState } from "react";

interface ReviewSummary {
  name: string;
  width: number;
  height: number;
  bytes: number;
  ratio: string;
  notes: string[];
}

export default function AiImageCheckerApp() {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [error, setError] = useState("");

  async function onFileChange(file: File | null) {
    if (!file) {
      setSummary(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      setSummary(null);
      return;
    }

    setError("");

    const imageUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not read image metadata."));
        img.src = imageUrl;
      });

      const notes: string[] = [];

      if (file.name.toLowerCase().endsWith(".png")) {
        notes.push("PNG input can preserve synthetic artifacts that are harder to see in compressed formats.");
      }

      if (image.width === image.height) {
        notes.push("Square dimensions are common in generated image workflows, but not conclusive.");
      }

      if (file.size < 120_000) {
        notes.push("Very small file size may indicate heavy compression or lightweight generation output.");
      }

      if (notes.length === 0) {
        notes.push("No obvious heuristic trigger from basic metadata alone. Visual review is still necessary.");
      }

      setSummary({
        name: file.name,
        width: image.width,
        height: image.height,
        bytes: file.size,
        ratio: `${image.width}:${image.height}`,
        notes
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not inspect image.");
      setSummary(null);
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-950">Inspect an image locally</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Upload a file to inspect basic metadata and a few lightweight heuristic signals. This does not provide proof.
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => void onFileChange(event.target.files?.[0] ?? null)}
          className="mt-4 block w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
        />
        <p className="mt-3 text-sm text-orange-700">
          Heuristic review only. Provenance, context, and visual inspection still matter.
        </p>
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">Review summary</h3>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {!summary && !error && <p className="mt-3 text-sm text-slate-600">Upload an image to see dimensions, file size, and heuristic notes.</p>}
          {summary && (
            <dl className="mt-3 grid gap-3 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-900">File</dt>
                <dd>{summary.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Dimensions</dt>
                <dd>{summary.width} x {summary.height}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Aspect ratio</dt>
                <dd>{summary.ratio}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">File size</dt>
                <dd>{Math.round(summary.bytes / 1024)} KB</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white">
          <h3 className="text-lg font-semibold">Signals to review</h3>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
            {(summary?.notes ?? ["No notes yet."]).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

