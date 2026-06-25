import { useState, useMemo } from "react";

export default function MetaTagGeneratorApp() {
  const [title, setTitle] = useState("My Awesome Page");
  const [description, setDescription] = useState("A short description of what this page is about.");
  const [keywords, setKeywords] = useState("keyword1, keyword2, keyword3");
  const [author, setAuthor] = useState("");
  const [canonical, setCanonical] = useState("https://example.com/page");
  const [robots, setRobots] = useState("index, follow");
  const [copied, setCopied] = useState(false);

  const tags = useMemo(() => {
    const lines: string[] = [];
    if (title) lines.push(`<title>${title}</title>`);
    if (description) lines.push(`<meta name="description" content="${description}">`);
    if (keywords) lines.push(`<meta name="keywords" content="${keywords}">`);
    if (author) lines.push(`<meta name="author" content="${author}">`);
    if (robots) lines.push(`<meta name="robots" content="${robots}">`);
    if (canonical) lines.push(`<link rel="canonical" href="${canonical}">`);
    return lines.join("\n");
  }, [title, description, keywords, author, canonical, robots]);

  function copy() {
    navigator.clipboard.writeText(tags).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const titleLen = title.length;
  const descLen = description.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Page Info</h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-500">Title</label>
                <span className={`text-xs ${titleLen > 60 ? "text-orange-500" : "text-slate-400"}`}>{titleLen}/60</span>
              </div>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-500">Description</label>
                <span className={`text-xs ${descLen > 160 ? "text-orange-500" : "text-slate-400"}`}>{descLen}/160</span>
              </div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Keywords</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" placeholder="comma, separated, keywords" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Canonical URL</label>
              <input type="text" value={canonical} onChange={(e) => setCanonical(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-mono text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Robots</label>
              <select value={robots} onChange={(e) => setRobots(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <option value="index, follow">index, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
              </select>
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
            <h3 className="mb-3 text-base font-semibold text-slate-950">Google Preview</h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 truncate">{canonical}</p>
              <p className="mt-1 text-base font-medium text-blue-700 truncate">{title || "Page Title"}</p>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{description || "Page description"}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
