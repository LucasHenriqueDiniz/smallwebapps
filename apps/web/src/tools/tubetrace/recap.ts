/**
 * A recap of one calendar year of watch history.
 *
 * Years, months, weekdays and hours are read in a given IANA time zone, so the
 * same file gives the same recap in a test as in the visitor's browser, where
 * the zone is the browser's own. A view at 02:30 UTC on 1 January belongs to the
 * previous year in São Paulo, and the recap says so rather than splitting the
 * night in two.
 *
 * Counts only. Takeout records when a video was opened, not how long it played,
 * so nothing here is a duration.
 */
import type { WatchEntry } from "./history";

export type LocalParts = { year: number; month: number; weekday: number; hour: number };

export type StampedEntry = { entry: WatchEntry; local: LocalParts };

export type Ranked = { label: string; count: number };

export type YearRecap = {
  year: number;
  videos: number;
  channels: number;
  topChannels: Ranked[];
  rewatched: (Ranked & { url: string })[];
  busiestMonth: Ranked & { month: number };
  busiestWeekday: Ranked & { weekday: number };
  peakHour: { hour: number; count: number };
  firstVideo: WatchEntry;
};

const TOP = 5;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function stampEntries(entries: readonly WatchEntry[], timeZone: string): StampedEntry[] {
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  });
  return entries.map((entry) => {
    const parts: Record<string, string> = {};
    for (const part of format.formatToParts(entry.time)) parts[part.type] = part.value;
    return {
      entry,
      local: {
        year: Number(parts.year),
        month: Number(parts.month) - 1,
        weekday: WEEKDAYS.indexOf(parts.weekday),
        hour: Number(parts.hour) % 24,
      },
    };
  });
}

/** Every year with at least one view, newest first. */
export function yearsIn(stamped: readonly StampedEntry[]): number[] {
  return [...new Set(stamped.map(({ local }) => local.year))].sort((a, b) => b - a);
}

function ranked(counts: Map<string, number>, limit: number): Ranked[] {
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
    .slice(0, limit);
}

/** Index of the largest bucket; the earliest wins a tie. */
function peak(buckets: number[]): number {
  return buckets.reduce((best, count, index) => (count > buckets[best] ? index : best), 0);
}

export function recapForYear(stamped: readonly StampedEntry[], year: number): YearRecap | null {
  const inYear = stamped.filter(({ local }) => local.year === year);
  if (inYear.length === 0) return null;

  const channels = new Map<string, number>();
  // A video keeps its most recent title: creators rename videos, and the
  // latest name is the one a viewer recognises.
  const views = new Map<string, { title: string; latest: Date; count: number }>();
  const months = new Array(12).fill(0);
  const weekdays = new Array(7).fill(0);
  const hours = new Array(24).fill(0);
  let first = inYear[0].entry;

  for (const { entry, local } of inYear) {
    channels.set(entry.channel, (channels.get(entry.channel) ?? 0) + 1);
    if (entry.url) {
      const seen = views.get(entry.url);
      const newer = !seen || entry.time > seen.latest;
      views.set(entry.url, {
        title: newer ? entry.title : seen.title,
        latest: newer ? entry.time : seen.latest,
        count: (seen?.count ?? 0) + 1,
      });
    }
    months[local.month] += 1;
    weekdays[local.weekday] += 1;
    hours[local.hour] += 1;
    if (entry.time < first.time) first = entry;
  }

  const rewatched = [...views]
    .filter(([, { count }]) => count > 1)
    .map(([url, { title, count }]) => ({ url, label: title, count }))
    .sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
    .slice(0, TOP);

  const month = peak(months);
  const weekday = peak(weekdays);
  const hour = peak(hours);

  return {
    year,
    videos: inYear.length,
    channels: channels.size,
    topChannels: ranked(channels, TOP),
    rewatched,
    busiestMonth: { month, label: MONTH_NAMES[month], count: months[month] },
    busiestWeekday: { weekday, label: WEEKDAY_NAMES[weekday], count: weekdays[weekday] },
    peakHour: { hour, count: hours[hour] },
    firstVideo: first,
  };
}
