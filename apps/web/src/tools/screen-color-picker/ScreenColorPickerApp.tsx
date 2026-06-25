import { useState } from "react";

interface PickedColor {
  hex: string;
  rgb: string;
  hsl: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function buildColor(hex: string): PickedColor {
  const { r, g, b } = hexToRgb(hex);
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHsl(r, g, b),
  };
}

const SUPPORTED = typeof window !== "undefined" && "EyeDropper" in window;

export default function ScreenColorPickerApp() {
  const [current, setCurrent] = useState<PickedColor | null>(null);
  const [history, setHistory] = useState<PickedColor[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function pick() {
    if (!SUPPORTED) return;
    try {
      // EyeDropper API - not in TS lib yet
      const EyeDropper = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
      const dropper = new EyeDropper();
      const result = await dropper.open();
      const color = buildColor(result.sRGBHex);
      setCurrent(color);
      setHistory(prev => [color, ...prev.filter(c => c.hex !== color.hex)].slice(0, 10));
      setError("");
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
      }
    }
  }

  function copy(val: string) {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(val);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  if (!SUPPORTED) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-base font-semibold text-amber-900">EyeDropper API not supported</p>
        <p className="mt-2 text-sm text-amber-700">
          The Screen Color Picker requires a Chromium-based browser (Chrome 95+, Edge 95+, Opera 81+).
          It is not available in Firefox or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <button
          onClick={pick}
          className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition"
        >
          Pick Color from Screen
        </button>
        <p className="mt-3 text-xs text-slate-400">Click the button, then click anywhere on your screen to sample a color</p>
        {error && <p className="mt-2 text-xs font-medium text-red-600">✗ {error}</p>}
      </section>

      {current && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Last Picked Color</h3>
          <div className="flex items-start gap-5">
            <div className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: current.hex }} />
            <div className="flex flex-col gap-2">
              {[
                { label: "HEX", value: current.hex },
                { label: "RGB", value: current.rgb },
                { label: "HSL", value: current.hsl },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-semibold text-slate-500">{label}</span>
                  <span className="font-mono text-sm text-slate-800">{value}</span>
                  <button onClick={() => copy(value)} className="text-xs text-slate-400 hover:text-slate-700">
                    {copied === value ? "✓" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">History (last {history.length})</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((color) => (
              <button
                key={color.hex}
                onClick={() => setCurrent(color)}
                title={color.hex}
                className={`group relative h-10 w-10 rounded-lg border-2 transition hover:scale-110 ${current?.hex === color.hex ? "border-blue-500" : "border-transparent"}`}
                style={{ backgroundColor: color.hex }}
              >
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  {color.hex}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
