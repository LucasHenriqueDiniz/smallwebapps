import { useMemo, useState } from "react";

function calcLoan(principal: number, annualRate: number, months: number) {
  if (annualRate === 0) {
    const monthly = principal / months;
    return { monthly, total: monthly * months, interest: 0 };
  }
  const r = annualRate / 100 / 12;
  const monthly = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = monthly * months;
  return { monthly, total, interest: total - principal };
}

export default function LoanCalculatorApp() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5");
  const [termValue, setTermValue] = useState("3");
  const [termUnit, setTermUnit] = useState<"years" | "months">("years");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const tv = parseFloat(termValue);
    if (isNaN(p) || isNaN(r) || isNaN(tv) || p <= 0 || r < 0 || tv <= 0) return null;
    const months = termUnit === "years" ? Math.round(tv * 12) : Math.round(tv);
    if (months <= 0) return null;
    const { monthly, total, interest } = calcLoan(p, r, months);
    return { monthly, total, interest, months };
  }, [principal, rate, termValue, termUnit]);

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tableMonths = result ? Math.min(result.months, 60) : 0;
  const amortization = useMemo(() => {
    if (!result) return [];
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    let balance = p;
    const rows = [];
    for (let i = 1; i <= tableMonths; i++) {
      const interestPart = r === 0 ? 0 : balance * r;
      const principalPart = result.monthly - interestPart;
      balance = Math.max(0, balance - principalPart);
      rows.push({ month: i, payment: result.monthly, principal: principalPart, interest: interestPart, balance });
    }
    return rows;
  }, [result, principal, rate, tableMonths]);

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Loan details</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Principal ($)</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Annual interest rate (%)</label>
            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Loan term</label>
            <div className="flex gap-2">
              <input type="number" value={termValue} onChange={(e) => setTermValue(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-2 ring-transparent focus:ring-blue-200" />
              <select value={termUnit} onChange={(e) => setTermUnit(e.target.value as "years" | "months")} className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none">
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {result && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Monthly Payment", value: `$${fmt(result.monthly)}`, highlight: true },
              { label: "Total Payment", value: `$${fmt(result.total)}` },
              { label: "Total Interest", value: `$${fmt(result.interest)}` },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-2xl border p-5 text-center ${highlight ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
                <div className="text-xs font-medium text-slate-500">{label}</div>
                <div className={`mt-1 text-2xl font-bold ${highlight ? "text-blue-700" : "text-slate-950"}`}>{value}</div>
              </div>
            ))}
          </section>

          {amortization.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-950">
                Amortization schedule (first {tableMonths} months{result.months > 60 ? " of " + result.months : ""})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                      <th className="pb-2 pr-4">Month</th>
                      <th className="pb-2 pr-4">Payment</th>
                      <th className="pb-2 pr-4">Principal</th>
                      <th className="pb-2 pr-4">Interest</th>
                      <th className="pb-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortization.map((row) => (
                      <tr key={row.month} className="border-b border-slate-50 text-slate-700">
                        <td className="py-1.5 pr-4">{row.month}</td>
                        <td className="py-1.5 pr-4">${fmt(row.payment)}</td>
                        <td className="py-1.5 pr-4">${fmt(row.principal)}</td>
                        <td className="py-1.5 pr-4">${fmt(row.interest)}</td>
                        <td className="py-1.5">${fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
