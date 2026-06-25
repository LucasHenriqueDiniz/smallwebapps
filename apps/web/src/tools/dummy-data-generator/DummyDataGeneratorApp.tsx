import { useState } from "react";

const FIRST_NAMES = ["Alice","Bob","Charlie","Diana","Edward","Fiona","George","Hannah","Ivan","Julia","Kevin","Laura","Mike","Nina","Oscar","Paula","Quinn","Rachel","Steve","Tina","Uma","Victor","Wendy","Xavier","Yara","Zach","Aaron","Bella","Carl","Dana"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Martinez","Anderson","Taylor","Thomas","Hernandez","Moore","Jackson","Martin","Lee","Thompson","White","Harris","Sanchez","Clark","Lewis","Robinson","Walker","Hall","Young","Allen","King"];
const DOMAINS = ["gmail.com","yahoo.com","outlook.com","proton.me","icloud.com","hotmail.com","mail.com","fastmail.com","hey.com","tutanota.com"];
const COMPANIES = ["Acme Corp","Globex","Initech","Umbrella LLC","Stark Industries","Wayne Enterprises","Oceanic Airlines","Soylent Corp","Dunder Mifflin","Vandelay Industries","Dharma Initiative","Buy N Large","Cyberdyne Systems","InGen","Veridian Dynamics"];
const STREETS = ["Main St","Oak Ave","Maple Dr","Cedar Ln","Elm Way","Pine Rd","River Blvd","Park Ave","Lake Dr","Hill Rd"];
const CITIES = ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte"];
const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat".split(" ");

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function genIP(): string { return `${randInt(1,254)}.${randInt(0,254)}.${randInt(0,254)}.${randInt(1,254)}`; }
function genPhone(): string { return `+1 (${randInt(200,999)}) ${randInt(200,999)}-${randInt(1000,9999)}`; }
function genDOB(): string {
  const y = randInt(1950, 2005), m = randInt(1, 12), d = randInt(1, 28);
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function genLorem(): string {
  const words: string[] = [];
  for (let i = 0; i < randInt(10, 20); i++) words.push(rand(LOREM_WORDS));
  return words.join(" ") + ".";
}

const FIELDS = [
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "company", label: "Company" },
  { key: "dob", label: "Date of Birth" },
  { key: "uuid", label: "UUID" },
  { key: "ip", label: "IP Address" },
  { key: "lorem", label: "Lorem Text" },
];

type Row = Record<string, string>;

function generateRow(selected: Set<string>): Row {
  const fn = rand(FIRST_NAMES), ln = rand(LAST_NAMES);
  const row: Row = {};
  if (selected.has("fullName")) row.fullName = `${fn} ${ln}`;
  if (selected.has("email")) row.email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1,99)}@${rand(DOMAINS)}`;
  if (selected.has("phone")) row.phone = genPhone();
  if (selected.has("address")) row.address = `${randInt(1,9999)} ${rand(STREETS)}, ${rand(CITIES)}`;
  if (selected.has("company")) row.company = rand(COMPANIES);
  if (selected.has("dob")) row.dob = genDOB();
  if (selected.has("uuid")) row.uuid = genUUID();
  if (selected.has("ip")) row.ip = genIP();
  if (selected.has("lorem")) row.lorem = genLorem();
  return row;
}

export default function DummyDataGeneratorApp() {
  const [count, setCount] = useState(10);
  const [selected, setSelected] = useState(new Set(["fullName", "email", "phone"]));
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function toggle(key: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function generate() {
    const rows: Row[] = Array.from({ length: count }, () => generateRow(selected));
    if (format === "json") {
      setOutput(JSON.stringify(rows, null, 2));
    } else {
      const keys = Array.from(selected);
      const header = keys.join(",");
      const lines = rows.map(r => keys.map(k => `"${(r[k] || "").replace(/"/g, '""')}"`).join(","));
      setOutput([header, ...lines].join("\n"));
    }
  }

  function download() {
    if (!output) return;
    const ext = format === "json" ? "json" : "csv";
    const mime = format === "json" ? "application/json" : "text/csv";
    const blob = new Blob([output], { type: mime });
    const a = document.createElement("a");
    a.download = `dummy-data.${ext}`;
    a.href = URL.createObjectURL(blob);
    a.click();
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Settings</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Rows</label>
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))} className="w-24 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as "json" | "csv")} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Fields</p>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map(({ key, label }) => (
              <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${selected.has(key) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <input type="checkbox" checked={selected.has(key)} onChange={() => toggle(key)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={selected.size === 0} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40">
          Generate
        </button>
      </section>

      {output && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">Output</h3>
            <div className="flex gap-2">
              <button onClick={copy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button onClick={download} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition">
                Download
              </button>
            </div>
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-800">
            {output}
          </pre>
        </section>
      )}
    </div>
  );
}
