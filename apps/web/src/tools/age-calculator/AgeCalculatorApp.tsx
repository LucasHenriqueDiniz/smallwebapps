import { useMemo, useState } from "react";

const ZODIAC = [
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
];

function getZodiac(month: number, day: number) {
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === 12 && em === 1) {
      if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return z.sign;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z.sign;
    }
  }
  return "Unknown";
}

export default function AgeCalculatorApp() {
  const [dob, setDob] = useState("1990-06-15");

  const result = useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    if (isNaN(birth.getTime()) || birth > now) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000);
    const totalHours = totalDays * 24;
    const totalSeconds = totalDays * 86400;

    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= now) nextBirthday.setFullYear(now.getFullYear() + 1);
    const daysToNext = Math.ceil((nextBirthday.getTime() - now.getTime()) / 86400000);

    const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());

    return { years, months, days, totalDays, totalHours, totalSeconds, daysToNext, zodiac };
  }, [dob]);

  return (
    <div className="mx-auto max-w-md grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">Date of birth</h3>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
        />
      </section>

      {result && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-950">Results</h3>
          <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-center">
            <span className="text-2xl font-bold text-blue-700">{result.years} years, {result.months} months, {result.days} days</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total days", value: result.totalDays.toLocaleString() },
              { label: "Total hours (approx)", value: result.totalHours.toLocaleString() },
              { label: "Total seconds (approx)", value: result.totalSeconds.toLocaleString() },
              { label: "Next birthday", value: `in ${result.daysToNext} days` },
              { label: "Zodiac sign", value: result.zodiac },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-0.5 text-sm font-bold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
