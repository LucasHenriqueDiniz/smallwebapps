import { useMemo, useState } from "react";

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  try {
    return decodeURIComponent(
      atob(padded).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch {
    return atob(padded);
  }
}

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderApp() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split(".");
    if (parts.length !== 3) return { error: "JWT must have 3 parts separated by dots." };
    try {
      const header = JSON.parse(base64urlDecode(parts[0]));
      const payload = JSON.parse(base64urlDecode(parts[1]));
      const sig = parts[2];

      const now = Math.floor(Date.now() / 1000);
      let expStatus: "valid" | "expired" | "no-exp" = "no-exp";
      let expDate = "";
      if (payload.exp) {
        expDate = new Date(payload.exp * 1000).toLocaleString();
        expStatus = payload.exp > now ? "valid" : "expired";
      }

      return { header, payload, sig, expStatus, expDate, error: "" };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Failed to decode JWT" };
    }
  }, [token]);

  function copyPanel(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">JWT token</h3>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200 break-all"
          placeholder="Paste your JWT here…"
          spellCheck={false}
        />
      </section>

      {decoded && (
        decoded.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{decoded.error}</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { key: "header", label: "Header", value: JSON.stringify(decoded.header, null, 2) },
              { key: "payload", label: "Payload", value: JSON.stringify(decoded.payload, null, 2) },
              { key: "sig", label: "Signature", value: decoded.sig ?? "" },
            ].map(({ key, label, value }) => (
              <section key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
                  <button
                    onClick={() => copyPanel(key, value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    {copiedKey === key ? "✓" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-700">{value}</pre>
              </section>
            ))}
          </div>
        )
      )}

      {decoded && !decoded.error && decoded.expStatus !== "no-exp" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${decoded.expStatus === "valid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
            >
              {decoded.expStatus === "valid" ? "Valid" : "Expired"}
            </span>
            <span className="text-sm text-slate-600">
              Expires: {decoded.expDate}
            </span>
          </div>
          {decoded.expStatus === "expired" && (
            <p className="mt-2 text-xs text-slate-500">Note: signature verification is not possible in the browser — this tool decodes the token structure only.</p>
          )}
        </section>
      )}
    </div>
  );
}
