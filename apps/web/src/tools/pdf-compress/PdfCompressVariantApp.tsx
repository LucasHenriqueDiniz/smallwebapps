import PdfCompressApp from "./PdfCompressApp";

type Props = {
  targetKB: number;
  label: string;
};

export default function PdfCompressVariantApp({ targetKB, label }: Props) {
  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-600">PDF compression target</p>
        <h3 className="mt-2 text-xl font-extrabold text-slate-950">Compress PDF toward {label}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Upload a PDF and try to reduce its file size locally in your browser. Exact target sizes are not guaranteed
          because some PDFs are already optimized or contain images that cannot be safely re-encoded here.
        </p>
      </section>
      <PdfCompressApp targetKB={targetKB} />
    </div>
  );
}
