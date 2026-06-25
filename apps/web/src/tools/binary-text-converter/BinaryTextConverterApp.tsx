import { useState } from "react";

function textToBinary(text: string): string {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text)).map(b => b.toString(2).padStart(8, "0")).join(" ");
}

function textToHex(text: string): string {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text)).map(b => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
}

function textToOctal(text: string): string {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text)).map(b => b.toString(8).padStart(3, "0")).join(" ");
}

function textToDecimal(text: string): string {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text)).join(" ");
}

function binaryToText(binary: string): string {
  const bytes = binary.trim().split(/\s+/).map(b => parseInt(b, 2));
  if (bytes.some(isNaN)) return "";
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}

function hexToText(hex: string): string {
  const bytes = hex.trim().split(/\s+/).map(h => parseInt(h, 16));
  if (bytes.some(isNaN)) return "";
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}

export default function BinaryTextConverterApp() {
  const [text, setText] = useState("Hello");
  const [binary, setBinary] = useState(textToBinary("Hello"));
  const [hex, setHex] = useState(textToHex("Hello"));
  const [error, setError] = useState("");

  function fromText(val: string) {
    setText(val);
    setBinary(textToBinary(val));
    setHex(textToHex(val));
    setError("");
  }

  function fromBinary(val: string) {
    setBinary(val);
    const t = binaryToText(val);
    if (t !== "" || val.trim() === "") {
      setText(t);
      setHex(textToHex(t));
      setError("");
    } else {
      setError("Invalid binary input");
    }
  }

  function fromHex(val: string) {
    setHex(val);
    const t = hexToText(val);
    if (t !== "" || val.trim() === "") {
      setText(t);
      setBinary(textToBinary(t));
      setError("");
    } else {
      setError("Invalid hex input");
    }
  }

  function copy(val: string) {
    navigator.clipboard.writeText(val);
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Text (UTF-8)", value: text, onChange: fromText, mono: false },
          { label: "Binary (8-bit bytes)", value: binary, onChange: fromBinary, mono: true },
          { label: "Hexadecimal", value: hex, onChange: fromHex, mono: true },
        ].map(({ label, value, onChange, mono }) => (
          <section key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
              <button onClick={() => copy(value)} className="text-xs text-slate-400 hover:text-slate-700">Copy</button>
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200 ${mono ? "font-mono" : ""}`}
              spellCheck={false}
            />
          </section>
        ))}
      </div>

      {text && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Other Representations</h3>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="font-medium text-slate-500">Octal: </span>
              <span className="font-mono text-slate-800 break-all">{textToOctal(text)}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500">Decimal bytes: </span>
              <span className="font-mono text-slate-800 break-all">{textToDecimal(text)}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500">Char codes: </span>
              <span className="font-mono text-slate-800 break-all">
                {Array.from(text).map(c => c.charCodeAt(0)).join(", ")}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-500">Byte length: </span>
              <span className="font-mono text-slate-800">{new TextEncoder().encode(text).length}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
