import { useMemo, useState } from "react";

type Check = {
  label: string;
  status: "good" | "warn" | "bad";
  detail: string;
};

function textOf(doc: Document, selector: string) {
  return doc.querySelector(selector)?.textContent?.trim() ?? "";
}

function meta(doc: Document, key: string) {
  return (
    doc.querySelector(`meta[name="${key}"]`)?.getAttribute("content")?.trim() ??
    doc.querySelector(`meta[property="${key}"]`)?.getAttribute("content")?.trim() ??
    ""
  );
}

function statusClass(status: Check["status"]) {
  if (status === "good") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "warn") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}

export default function MetaTagsAnalyzerApp() {
  const [html, setHtml] = useState("");

  const result = useMemo(() => {
    if (!html.trim()) return null;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = textOf(doc, "title");
    const description = meta(doc, "description");
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href")?.trim() ?? "";
    const viewport = meta(doc, "viewport");
    const robots = meta(doc, "robots");
    const h1Count = doc.querySelectorAll("h1").length;
    const checks: Check[] = [
      {
        label: "Title",
        status: title.length >= 30 && title.length <= 65 ? "good" : title ? "warn" : "bad",
        detail: title ? `${title.length} characters` : "Missing title tag",
      },
      {
        label: "Meta description",
        status: description.length >= 120 && description.length <= 160 ? "good" : description ? "warn" : "bad",
        detail: description ? `${description.length} characters` : "Missing description",
      },
      {
        label: "Canonical",
        status: canonical ? "good" : "warn",
        detail: canonical || "No canonical URL found",
      },
      {
        label: "Viewport",
        status: viewport.includes("width=device-width") ? "good" : viewport ? "warn" : "bad",
        detail: viewport || "Missing responsive viewport",
      },
      {
        label: "H1",
        status: h1Count === 1 ? "good" : h1Count > 1 ? "warn" : "bad",
        detail: `${h1Count} H1 tag${h1Count === 1 ? "" : "s"} found`,
      },
      {
        label: "Open Graph",
        status: meta(doc, "og:title") && meta(doc, "og:description") ? "good" : "warn",
        detail: meta(doc, "og:title") ? "OG title found" : "Missing OG title",
      },
      {
        label: "Robots",
        status: robots.includes("noindex") ? "bad" : robots ? "good" : "warn",
        detail: robots || "No robots meta tag",
      },
    ];
    return { title, description, canonical, viewport, robots, checks };
  }, [html]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Technical SEO</p>
        <h3 className="mt-1 text-lg font-extrabold text-slate-950">Analyze pasted HTML</h3>
        <textarea
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder='Paste the <head> section or a full HTML document here...'
          className="mt-4 min-h-[430px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-800 outline-none transition focus:border-blue-500"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-extrabold text-slate-950">SEO checks</h3>
        {!result ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Paste HTML to inspect title, description, canonical, viewport, robots, and social tags.
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {result.checks.map((check) => (
              <div key={check.label} className={`rounded-xl border p-3 ${statusClass(check.status)}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold">{check.label}</span>
                  <span className="text-xs font-black uppercase tracking-wide">{check.status}</span>
                </div>
                <p className="mt-1 break-words text-sm opacity-90">{check.detail}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
