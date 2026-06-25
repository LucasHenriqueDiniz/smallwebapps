import { useState, useCallback } from "react";

const MAX_BYTES = 64 * 1024; // 64KB

function toHexDump(buffer: Uint8Array): string {
  const lines: string[] = [];
  for (let i = 0; i < buffer.length; i += 16) {
    const slice = buffer.slice(i, i + 16);
    const offset = i.toString(16).padStart(8, "0").toUpperCase();
    const hex = Array.from(slice)
      .map(b => b.toString(16).padStart(2, "0").toUpperCase())
      .join(" ")
      .padEnd(16 * 3 - 1, " ");
    const ascii = Array.from(slice)
      .map(b => (b >= 0x20 && b < 0x7f) ? String.fromCharCode(b) : ".")
      .join("");
    lines.push(`${offset}  ${hex}  ${ascii}`);
  }
  return lines.join("\n");
}

export default function HexDumpApp() {
  const [output, setOutput] = useState("");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; truncated: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const full = new Uint8Array(e.target?.result as ArrayBuffer);
      const truncated = full.length > MAX_BYTES;
      const data = truncated ? full.slice(0, MAX_BYTES) : full;
      setOutput(toHexDump(data));
      setFileInfo({ name: file.name, size: file.size, truncated });
    };
    reader.readAsArrayBuffer(file);
  }, []);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="flex flex-col gap-5">
      <section
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.onchange = () => { const f = inp.files?.[0]; if (f) processFile(f); }; inp.click(); }}
      >
        <p className="text-sm font-medium text-slate-700">Drop any file here or click to browse</p>
        <p className="mt-1 text-xs text-slate-400">Shows the first 64 KB as a hex dump</p>
      </section>

      {fileInfo && (
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-slate-700">{fileInfo.name}</span>
          <span className="text-slate-500">{formatSize(fileInfo.size)}</span>
          {fileInfo.truncated && (
            <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Showing first 64 KB only
            </span>
          )}
        </div>
      )}

      {output && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Hex Dump</h3>
            <span className="text-xs text-slate-500 font-mono">OFFSET    00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ASCII</span>
          </div>
          <pre className="max-h-[600px] overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed">
            {output}
          </pre>
        </section>
      )}
    </div>
  );
}
