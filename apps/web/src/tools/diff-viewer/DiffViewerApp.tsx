import { useState } from "react";

const ORIG = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const x = 10;
const y = 20;
`;

const MOD = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return name;
}

const x = 10;
const z = 30;
const result = x + z;
`;

interface Change {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function DiffViewerApp() {
  const [original, setOriginal] = useState(ORIG);
  const [modified, setModified] = useState(MOD);
  const [diff, setDiff] = useState<Change[]>([]);
  const [stats, setStats] = useState<{ added: number; removed: number } | null>(null);
  const [computed, setComputed] = useState(false);

  async function compute() {
    const { diffLines } = await import("diff");
    const changes = diffLines(original, modified);
    setDiff(changes);
    let added = 0, removed = 0;
    for (const c of changes) {
      const lines = c.value.split("\n").filter(l => l !== "").length;
      if (c.added) added += lines;
      if (c.removed) removed += lines;
    }
    setStats({ added, removed });
    setComputed(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={compute} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          Compare
        </button>
        {stats && (
          <span className="text-xs text-slate-600">
            <span className="font-semibold text-emerald-600">+{stats.added} lines added</span>
            {" · "}
            <span className="font-semibold text-red-600">-{stats.removed} lines removed</span>
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Original</h3>
          <textarea
            value={original}
            onChange={(e) => { setOriginal(e.target.value); setComputed(false); }}
            className="min-h-56 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Modified</h3>
          <textarea
            value={modified}
            onChange={(e) => { setModified(e.target.value); setComputed(false); }}
            className="min-h-56 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            spellCheck={false}
          />
        </section>
      </div>

      {computed && diff.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Unified Diff</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
            {diff.map((change, i) => {
              const lines = change.value.split("\n");
              if (lines[lines.length - 1] === "") lines.pop();
              return lines.map((line, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`flex items-start gap-2 px-4 py-0.5 font-mono text-sm ${
                    change.added
                      ? "bg-emerald-50 text-emerald-800"
                      : change.removed
                      ? "bg-red-50 text-red-800"
                      : "text-slate-700"
                  }`}
                >
                  <span className="w-4 shrink-0 select-none text-slate-400">
                    {change.added ? "+" : change.removed ? "-" : " "}
                  </span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ));
            })}
          </div>
        </section>
      )}
    </div>
  );
}
