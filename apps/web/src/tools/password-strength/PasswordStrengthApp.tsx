import { useMemo, useState } from "react";

function getCharSpace(password: string) {
  let space = 0;
  if (/[a-z]/.test(password)) space += 26;
  if (/[A-Z]/.test(password)) space += 26;
  if (/[0-9]/.test(password)) space += 10;
  if (/[^a-zA-Z0-9]/.test(password)) space += 32;
  return space || 1;
}

function formatCrackTime(entropy: number): string {
  // Assume 1 billion guesses/sec
  const guesses = Math.pow(2, entropy);
  const seconds = guesses / 1e9;
  if (seconds < 1) return "Instant";
  if (seconds < 60) return `~${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `~${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `~${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `~${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1000) return `~${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e9) return `~${(seconds / 31536000 / 1e6).toFixed(1)}M years`;
  return "Centuries";
}

function strengthLevel(entropy: number) {
  if (entropy < 36) return { level: 0, label: "Very Weak", color: "bg-red-500" };
  if (entropy < 60) return { level: 1, label: "Weak", color: "bg-orange-400" };
  if (entropy < 80) return { level: 2, label: "Fair", color: "bg-amber-400" };
  if (entropy < 100) return { level: 3, label: "Strong", color: "bg-blue-500" };
  return { level: 4, label: "Very Strong", color: "bg-emerald-500" };
}

export default function PasswordStrengthApp() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const analysis = useMemo(() => {
    const len = password.length;
    const space = getCharSpace(password);
    const entropy = len > 0 ? len * Math.log2(space) : 0;
    const strength = strengthLevel(entropy);
    const crackTime = len > 0 ? formatCrackTime(entropy) : "—";

    const checks = [
      { label: "Uppercase letters", ok: /[A-Z]/.test(password) },
      { label: "Lowercase letters", ok: /[a-z]/.test(password) },
      { label: "Numbers", ok: /[0-9]/.test(password) },
      { label: "Special symbols", ok: /[^a-zA-Z0-9]/.test(password) },
      { label: "At least 12 characters", ok: len >= 12 },
    ];

    return { len, entropy, strength, crackTime, checks };
  }, [password]);

  return (
    <div className="mx-auto max-w-xl grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Enter a password</h3>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            placeholder="Type a password to analyze…"
            autoComplete="off"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </section>

      {password && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-950">Strength</h3>
              <span className="text-sm font-bold text-slate-700">{analysis.strength.label}</span>
            </div>
            <div className="mb-4 h-3 w-full rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full transition-all ${analysis.strength.color}`}
                style={{ width: `${(analysis.strength.level + 1) * 20}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Length</div>
                <div className="text-lg font-bold text-slate-950">{analysis.len}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Entropy</div>
                <div className="text-lg font-bold text-slate-950">{Math.round(analysis.entropy)} bits</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Estimated crack time (1B guesses/sec)</div>
              <div className="text-base font-bold text-slate-950">{analysis.crackTime}</div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-base font-semibold text-slate-950">Checks</h3>
            <div className="space-y-2">
              {analysis.checks.map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <span className={ok ? "text-emerald-500" : "text-slate-300"}>
                    {ok ? "✓" : "✗"}
                  </span>
                  <span className={ok ? "text-slate-700" : "text-slate-400"}>{label}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
