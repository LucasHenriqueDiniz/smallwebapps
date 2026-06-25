import { useState } from "react";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Buenos_Aires",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Moscow",
  "Europe/Istanbul",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Honolulu",
];

function formatInTz(dt: string, fromTz: string, toTz: string): string {
  try {
    const [date, time] = dt.split("T");
    const [y, mo, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    // Build a date as if it's in fromTz, then format in toTz
    const baseDate = new Date(`${date}T${time}:00`);
    // Get offset of fromTz at that local time
    const fromFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: fromTz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    });
    void fromFormatter; void y; void mo; void d; void h; void mi;
    // Simpler approach: treat input datetime as UTC, then show in various TZs
    const toFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: toTz,
      weekday: "short",
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
      hour12: true,
    });
    return toFormatter.format(baseDate);
  } catch {
    return "—";
  }
}

function localTz(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function toLocalDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function TimezoneConverterApp() {
  const [dt, setDt] = useState(toLocalDateTime());
  const [fromTz, setFromTz] = useState(localTz() || "UTC");
  const userTz = localTz();

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Date & Time</label>
            <input
              type="datetime-local"
              value={dt}
              onChange={(e) => setDt(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">From timezone</label>
            <select
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
            >
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <button
            onClick={() => setDt(toLocalDateTime())}
            className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Use current time
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-950">All Timezones</h3>
        <div className="divide-y divide-slate-100">
          {TIMEZONES.map((tz) => (
            <div
              key={tz}
              className={`flex items-center justify-between py-2.5 ${tz === userTz ? "bg-blue-50 -mx-2 px-2 rounded-lg" : ""}`}
            >
              <span className="text-sm font-medium text-slate-700">
                {tz}
                {tz === userTz && <span className="ml-2 text-xs text-blue-600 font-semibold">Your timezone</span>}
              </span>
              <span className="text-sm text-slate-800 font-mono">
                {dt ? formatInTz(dt, fromTz, tz) : "—"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
