import { useMemo, useState } from "react";

function getMeta(doc: Document, key: string) {
  return (
    doc.querySelector(`meta[property="${key}"]`)?.getAttribute("content")?.trim() ??
    doc.querySelector(`meta[name="${key}"]`)?.getAttribute("content")?.trim() ??
    ""
  );
}

export default function OpenGraphCheckerApp() {
  const [html, setHtml] = useState("");

  const data = useMemo(() => {
    if (!html.trim()) return null;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const fields = {
      title: getMeta(doc, "og:title") || doc.querySelector("title")?.textContent?.trim() || "",
      description: getMeta(doc, "og:description") || getMeta(doc, "description"),
      image: getMeta(doc, "og:image"),
      url: getMeta(doc, "og:url"),
      type: getMeta(doc, "og:type"),
      twitterCard: getMeta(doc, "twitter:card"),
      twitterTitle: getMeta(doc, "twitter:title"),
      twitterDescription: getMeta(doc, "twitter:description"),
      twitterImage: getMeta(doc, "twitter:image"),
    };
    const required = [
      ["og:title", fields.title],
      ["og:description", fields.description],
      ["og:image", fields.image],
      ["og:url", fields.url],
      ["og:type", fields.type],
    ];
    return { fields, required };
  }, [html]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Social preview</p>
        <h3 className="mt-1 text-lg font-extrabold text-slate-950">Check Open Graph tags</h3>
        <textarea
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder='Paste HTML that contains meta property="og:title", og:description, og:image...'
          className="mt-4 min-h-[430px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-800 outline-none transition focus:border-blue-500"
        />
      </section>

      <section className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-extrabold text-slate-950">Preview</h3>
          {!data ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Paste HTML to generate a local social preview.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {data.fields.image ? (
                <img src={data.fields.image} alt="" className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-400">
                  No og:image
                </div>
              )}
              <div className="p-4">
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {data.fields.url || "No og:url"}
                </p>
                <h4 className="mt-1 line-clamp-2 text-base font-extrabold text-slate-950">
                  {data.fields.title || "No title found"}
                </h4>
                <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">
                  {data.fields.description || "No description found"}
                </p>
              </div>
            </div>
          )}
        </div>

        {data && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-extrabold text-slate-950">Required tags</h3>
            <div className="mt-3 grid gap-2">
              {data.required.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-slate-600">{label}</span>
                  <span className={`text-xs font-black uppercase ${value ? "text-emerald-600" : "text-red-600"}`}>
                    {value ? "found" : "missing"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
