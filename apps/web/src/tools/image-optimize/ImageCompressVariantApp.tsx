import ImageOptimizeApp from "./ImageOptimizeApp";

type Props = {
  targetKB: number;
  formatLabel?: string;
};

export default function ImageCompressVariantApp({ targetKB, formatLabel = "image" }: Props) {
  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-600">Image compression target</p>
        <h3 className="mt-2 text-xl font-extrabold text-slate-950">
          Compress {formatLabel} toward {targetKB}KB
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Use the optimizer below to reduce file size locally in your browser. Exact target sizes depend on the
          original image dimensions, format, and visual complexity, so adjust quality until the output is close.
        </p>
      </section>
      <ImageOptimizeApp initialMaxSizeMB={targetKB / 1024} />
    </div>
  );
}
