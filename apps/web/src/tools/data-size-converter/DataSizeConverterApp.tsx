import { useState } from "react";

type Mode = "decimal" | "binary";

interface Unit {
  label: string;
  toBits: (mode: Mode) => bigint;
  decimal?: boolean;
  binary?: boolean;
}

const UNITS: Unit[] = [
  { label: "Bit",      toBits: () => 1n },
  { label: "Byte",     toBits: () => 8n },
  { label: "KB",       toBits: (m) => m === "decimal" ? 8n * 1000n : 8n * 1024n },
  { label: "MB",       toBits: (m) => m === "decimal" ? 8n * 1000n ** 2n : 8n * 1024n ** 2n },
  { label: "GB",       toBits: (m) => m === "decimal" ? 8n * 1000n ** 3n : 8n * 1024n ** 3n },
  { label: "TB",       toBits: (m) => m === "decimal" ? 8n * 1000n ** 4n : 8n * 1024n ** 4n },
  { label: "PB",       toBits: (m) => m === "decimal" ? 8n * 1000n ** 5n : 8n * 1024n ** 5n },
  { label: "Kibibyte", toBits: () => 8n * 1024n },
  { label: "Mebibyte", toBits: () => 8n * 1024n ** 2n },
  { label: "Gibibyte", toBits: () => 8n * 1024n ** 3n },
  { label: "Tebibyte", toBits: () => 8n * 1024n ** 4n },
];

function formatResult(bits: bigint, factor: bigint): string {
  if (factor === 1n) return bits.toString();
  const whole = bits / factor;
  const rem = bits % factor;
  if (rem === 0n) return whole.toString();
  // Show up to 6 decimal places using integer arithmetic
  const decimals = (rem * 1_000_000n) / factor;
  const decStr = decimals.toString().padStart(6, "0").replace(/0+$/, "");
  return `${whole}.${decStr}`;
}

export default function DataSizeConverterApp() {
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState("GB");
  const [mode, setMode] = useState<Mode>("decimal");

  const selectedUnit = UNITS.find(u => u.label === unit) || UNITS[4];
  const inputNum = parseFloat(value) || 0;

  function convertTo(target: Unit): string {
    if (inputNum <= 0) return "0";
    try {
      const scale = 1_000_000n;
      const inputBits = BigInt(Math.round(inputNum * 1_000_000)) * selectedUnit.toBits(mode) / scale;
      const targetFactor = target.toBits(mode);
      return formatResult(inputBits, targetFactor);
    } catch {
      return "—";
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-36 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
              min={0}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {UNITS.map(u => <option key={u.label} value={u.label}>{u.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            {(["decimal", "binary"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-3 py-3 text-xs font-medium transition ${mode === m ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {m === "decimal" ? "Decimal (1 KB = 1000 B)" : "Binary (1 KiB = 1024 B)"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">All Units</h3>
        <div className="divide-y divide-slate-100">
          {UNITS.map((u) => (
            <div key={u.label} className={`flex items-center justify-between py-2.5 ${u.label === unit ? "font-semibold" : ""}`}>
              <span className="text-sm text-slate-700">{u.label}</span>
              <span className="font-mono text-sm text-slate-800">{convertTo(u)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
