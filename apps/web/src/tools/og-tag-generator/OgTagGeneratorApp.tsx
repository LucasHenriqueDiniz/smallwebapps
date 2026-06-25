import { useState, useMemo } from "react";

export default function OgTagGeneratorApp() {
  const [ogTitle, setOgTitle] = useState("My Awesome Page");
  const [ogDescription, setOgDescription] = useState("A short description of what this page is about.");
  const [ogUrl, setOgUrl] = useState("https://example.com/page");
  const [ogImage, setOgImage] = useState("https://example.com/og-image.png");
  const [ogType, setOgType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterSite, setTwitterSite] = useState("@yourhandle");
  const [copied, setCopied] = useState(false);

  const tags = useMemo(() => {
    const lines: string[] = [];
    lines.push(`<!-- Open Graph -->`);
    if (ogTitle) lines.push(`<meta property="og:title" content="${ogTitle}">`);
    if (ogDescription) lines.push(`<meta property="og:description" content="${ogDescription}">`);
    if (ogUrl) lines.push(`<meta property="og:url" content="${ogUrl}">`);
    if (ogImage) lines.push(`<meta property="og:image" content="${ogImage}">`);
    if (ogType) lines.push(`<meta property="og:type" content="${ogType}">`);
    lines.push(`\n<!-- Twitter Card -->`);
    if (twitterCard) lines.push(`<meta name="twitter:card" content="${twitterCard}">`);
    if (twitterSite) lines.push(`<meta name="twitter:site" content="${twitterSite}">`);
    if (ogTitle) lines.push(`<meta name="twitter:title" content="${ogTitle}">`);
    if (ogDescription) lines.push(`<meta name="twitter:description" content="${ogDescription}">`);
    if (ogImage) lines.push(`<meta name="twitter:image" content="${ogImage}">`);
    return lines.join("\n");
  }, [ogTitle, ogDescription, ogUrl, ogImage, ogType, twitterCard, twitterSite]);

  function copy() {
    navigator.clipboard.writeText(tags).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Open Graph Settings</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "OG Title", value: ogTitle, set: setOgTitle },
              { label: "OG URL", value: ogUrl, set: setOgUrl },
              { label: "OG Image URL", value: ogImage, set: setOgImage },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
                <input type="text" value={value} onChange={(e) => set(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">OG Description</label>
              <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">OG Type</label>
              <select value={ogType} onChange={(e) => setOgType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
                <option value="profile">profile</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Twitter Card Type</label>
              <select value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
                <option value="app">app</option>
                <option value="player">player</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Twitter Site Handle</label>
              <input type="text" value={twitterSite} onChange={(e) => setTwitterSite(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" placeholder="@handle" />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-950">Generated Tags</h3>
              <button onClick={copy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs text-slate-200 leading-relaxed font-mono">
              {tags}
            </pre>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-base font-semibold text-slate-950">Preview</h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              {ogImage && (
                <div className="h-32 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  {ogImage.startsWith("http") ? <img src={ogImage} alt="OG preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <span>Image preview</span>}
                </div>
              )}
              <div className="p-3">
                <p className="text-xs text-slate-500 truncate">{ogUrl}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{ogTitle}</p>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{ogDescription}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
