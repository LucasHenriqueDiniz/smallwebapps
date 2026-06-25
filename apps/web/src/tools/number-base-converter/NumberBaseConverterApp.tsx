import { useState } from "react";

function toBin32(n: number) {
  const bin = (n >>> 0).toString(2).padStart(32, "0");
  return bin.match(/.{4}/g)?.join(" ") ?? bin;
}

export default function NumberBaseConverterApp() {
  const [dec, setDec] = useState("42");
  const [bin, setBin] = useState("101010");
  const [oct, setOct] = useState("52");
  const [hex, setHex] = useState("2A");
  const [error, setError] = useState("");

  function fromDec(val: string) {
    setDec(val);
    setError("");
    const n = parseInt(val, 10);
    if (val === "" || isNaN(n)) { setBin(""); setOct(""); setHex(""); return; }
    setBin(n.toString(2));
    setOct(n.toString(8));
    setHex(n.toString(16).toUpperCase());
  }

  function fromBin(val: string) {
    setBin(val);
    setError("");
    if (!/^[01]*$/.test(val)) { setError("Binary: only 0 and 1 allowed"); return; }
    const n = parseInt(val, 2);
    if (val === "" || isNaN(n)) { setDec(""); setOct(""); setHex(""); return; }
    setDec(n.toString(10));
    setOct(n.toString(8));
    setHex(n.toString(16).toUpperCase());
  }

  function fromOct(val: string) {
    setOct(val);
    setError("");
    if (!/^[0-7]*$/.test(val)) { setError("Octal: digits 0-7 only"); return; }
    const n = parseInt(val, 8);
    if (val === "" || isNaN(n)) { setDec(""); setBin(""); setHex(""); return; }
    setDec(n.toString(10));
    setBin(n.toString(2));
    setHex(n.toString(16).toUpperCase());
  }

  function fromHex(val: string) {
    setHex(val.toUpperCase());
    setError("");
    if (!/^[0-9A-Fa-f]*$/.test(val)) { setError("Hex: digits 0-9 and A-F only"); return; }
    const n = parseInt(val, 16);
    if (val === "" || isNaN(n)) { setDec(""); setBin(""); setOct(""); return; }
    setDec(n.toString(10));
    setBin(n.toString(2));
    setOct(n.toString(8));
  }

  const decNum = parseInt(dec, 10);
  const bin32 = dec && !isNaN(decNum) ? toBin32(decNum) : "";

  const fields = [
    { label: "Decimal (base 10)", value: dec, onChange: fromDec, placeholder: "e.g. 42" },
    { label: "Binary (base 2)", value: bin, onChange: fromBin, placeholder: "e.g. 101010" },
    { label: "Octal (base 8)", value: oct, onChange: fromOct, placeholder: "e.g. 52" },
    { label: "Hexadecimal (base 16)", value: hex, onChange: fromHex, placeholder: "e.g. 2A" },
  ];

  return (
    <div className="mx-auto max-w-lg grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Number Base Converter</h3>
        <p className="mb-4 text-sm text-slate-500">Edit any field — the others update automatically.</p>
        <div className="space-y-4">
          {fields.map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
                spellCheck={false}
              />
            </div>
          ))}
        </div>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </section>

      {bin32 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-950">32-bit binary representation</h3>
          <div className="font-mono text-sm tracking-wider text-slate-600 break-all">{bin32}</div>
        </section>
      )}
    </div>
  );
}
