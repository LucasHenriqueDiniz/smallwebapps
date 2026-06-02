import type { AnalyticsData, BingeSession, WatchEntry } from "./types";
import {
  differenceInMinutes, differenceInDays, parseISO,
  getHours, getDay, format, startOfMonth, startOfYear, addDays
} from "date-fns";
import { gunzipSync, unzipSync } from "fflate";

export type HistoryParseErrorCode =
  | "UNSUPPORTED_FORMAT"
  | "ARCHIVE_TOO_LARGE"
  | "NO_HISTORY_FILE"
  | "NO_ENTRIES";

export class HistoryParseError extends Error {
  constructor(public code: HistoryParseErrorCode) {
    super(code);
    this.name = "HistoryParseError";
  }
}

const ptMonths: Record<string, number> = {
  "jan": 0, "fev": 1, "mar": 2, "abr": 3, "mai": 4, "jun": 5,
  "jul": 6, "ago": 7, "set": 8, "out": 9, "nov": 10, "dez": 11
};

const MAX_ARCHIVE_BYTES = 300 * 1024 * 1024;
const textDecoder = new TextDecoder("utf-8");

export async function parseHistoryFile(file: File): Promise<AnalyticsData> {
  const historyFile = await resolveHistoryFile(file);
  const entries = parseHistoryText(historyFile.name, historyFile.text);

  if (entries.length === 0) {
    throw new HistoryParseError("NO_ENTRIES");
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  return computeAnalytics(entries);
}

async function resolveHistoryFile(file: File): Promise<{ name: string; text: string }> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".json") || name.endsWith(".html")) {
    return { name: file.name, text: await file.text() };
  }

  if (file.size > MAX_ARCHIVE_BYTES) {
    throw new HistoryParseError("ARCHIVE_TOO_LARGE");
  }

  if (name.endsWith(".zip")) {
    const files = unzipSync(new Uint8Array(await file.arrayBuffer()));
    const candidates = Object.entries(files).map(([path, bytes]) => ({ path, bytes }));
    return pickHistoryFile(candidates);
  }

  if (name.endsWith(".tgz") || name.endsWith(".tar.gz")) {
    const ungzipped = gunzipSync(new Uint8Array(await file.arrayBuffer()));
    return pickHistoryFile(readTarEntries(ungzipped));
  }

  throw new HistoryParseError("UNSUPPORTED_FORMAT");
}

function pickHistoryFile(
  candidates: { path: string; bytes: Uint8Array }[],
): { name: string; text: string } {
  const scored = candidates
    .filter(({ path, bytes }) => isTextHistoryCandidate(path) && bytes.length > 0)
    .map(({ path, bytes }) => {
      const preview = textDecoder.decode(bytes.slice(0, 32768)).toLowerCase();
      return {
        path,
        bytes,
        score: scoreHistoryCandidate(path, preview),
      };
    })
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) {
    throw new HistoryParseError("NO_HISTORY_FILE");
  }

  return {
    name: best.path,
    text: textDecoder.decode(best.bytes),
  };
}

function isTextHistoryCandidate(path: string): boolean {
  const lower = path.toLowerCase();
  return lower.endsWith(".json") || lower.endsWith(".html");
}

function scoreHistoryCandidate(path: string, preview: string): number {
  const lower = path.toLowerCase().replace(/\\/g, "/");
  const fileName = lower.split("/").pop() || lower;
  let score = 0;

  if (fileName === "watch-history.json") score += 120;
  if (fileName === "watch-history.html") score += 110;
  if (fileName === "myactivity.json") score += 80;
  if (lower.includes("youtube")) score += 30;
  if (lower.includes("history") || lower.includes("hist")) score += 20;
  if (lower.includes("takeout")) score += 10;
  if (preview.includes("youtube watch history")) score += 80;
  if (preview.includes("watched ") || preview.includes("content-cell")) score += 40;

  return score;
}

function readTarEntries(bytes: Uint8Array): { path: string; bytes: Uint8Array }[] {
  const entries: { path: string; bytes: Uint8Array }[] = [];
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    const header = bytes.slice(offset, offset + 512);
    const isEmpty = header.every(byte => byte === 0);
    if (isEmpty) break;

    const path = readTarString(header, 0, 100);
    const prefix = readTarString(header, 345, 155);
    const fullPath = prefix ? `${prefix}/${path}` : path;
    const sizeText = readTarString(header, 124, 12).trim();
    const size = parseInt(sizeText || "0", 8);
    const typeFlag = String.fromCharCode(header[156] || 0);
    const dataStart = offset + 512;

    if (fullPath && typeFlag !== "5" && size > 0) {
      entries.push({
        path: fullPath,
        bytes: bytes.slice(dataStart, dataStart + size),
      });
    }

    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  return entries;
}

function readTarString(bytes: Uint8Array, start: number, length: number): string {
  const slice = bytes.slice(start, start + length);
  const end = slice.indexOf(0);
  return textDecoder.decode(end >= 0 ? slice.slice(0, end) : slice).trim();
}

function parseHistoryText(name: string, text: string): WatchEntry[] {
  let entries: WatchEntry[] = [];

  if (name.toLowerCase().endsWith(".json")) {
    const data = JSON.parse(text);
    entries = data
      .filter((item: any) =>
        item.activityControls?.includes("YouTube watch history") &&
        item.title?.startsWith("Watched ")
      )
      .map((item: any) => ({
        id: Math.random().toString(36).substring(7),
        title: item.title.replace("Watched ", ""),
        channelName: item.subtitles?.[0]?.name || "Unknown Channel",
        channelUrl: item.subtitles?.[0]?.url,
        timestamp: item.time,
        date: parseISO(item.time),
      }));
  } else if (name.toLowerCase().endsWith(".html")) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const cells = doc.querySelectorAll(".content-cell");

    cells.forEach(cell => {
      // The watch-history HTML puts "Watched " as a text node BEFORE the links.
      // The first <a> is the video title, the second <a> is the channel.
      const cellText = cell.textContent?.trim() || "";
      // \s matches normal space and &nbsp; in JS
      if (!/^Watched\s/.test(cellText)) return;

      const links = Array.from(cell.querySelectorAll("a"));
      const videoLink =
        links.find(a => a.getAttribute("href")?.includes("watch?v=")) || links[0];
      const channelLink =
        links.find(a => {
          const h = a.getAttribute("href") || "";
          return h.includes("/channel/") || h.includes("/@") || h.includes("/user/");
        }) || links.find(a => a !== videoLink);

      {
        const title =
          videoLink?.textContent?.trim() ||
          cellText.replace(/^Watched\s+/, "").trim() ||
          "Unknown Video";
        const channelName = channelLink?.textContent?.trim() || "Unknown Channel";

        // Date is the text node that contains a 4-digit year.
        let dateStr = "";
        cell.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const tc = node.textContent?.trim() || "";
            if (/\d{4}/.test(tc)) dateStr = tc;
          }
        });

        let parsedDate = new Date();
        try {
          const match = dateStr.match(/(\d+)\s+de\s+([a-z]+)\.?\s+de\s+(\d{4}),\s+(\d{2}):(\d{2}):(\d{2})/i);
          if (match) {
            const [_, day, monthStr, year, h, m, s] = match;
            const month = ptMonths[monthStr.toLowerCase().substring(0, 3)] || 0;
            parsedDate = new Date(parseInt(year), month, parseInt(day), parseInt(h), parseInt(m), parseInt(s));
          } else {
            parsedDate = new Date(dateStr.replace(" BRT", "").replace(" BRST", ""));
          }
        } catch (e) {
          // fallback date
        }

        entries.push({
          id: Math.random().toString(36).substring(7),
          title,
          channelName,
          timestamp: parsedDate.toISOString(),
          date: parsedDate
        });
      }
    });
  }

  return entries;
}

export function generateDemoData(): AnalyticsData {
  const entries: WatchEntry[] = [];
  const now = new Date();
  let current = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000); // 2 years ago

  const channels = [
    "Marques Brownlee", "MrBeast", "Veritasium", "Kurzgesagt", "Tom Scott",
    "Linus Tech Tips", "Fireship", "Cleo Abram", "Lofi Girl", "3Blue1Brown",
    "Wendover Productions", "CGP Grey", "Half as Interesting", "Polymatter"
  ];

  const titles = [
    "I Tested Every Keyboard", "Building a PC in 2024", "Why we exist", "The history of space",
    "100 Days in Minecraft", "Learning Rust", "React in 100 Seconds", "Study Music 24/7",
    "The real story of", "Why this changes everything", "I spent 30 days", "The science of"
  ];

  // generate varied days to create realistic patterns
  while (current < now) {
    // random skip (inactive day ~30% of the time)
    if (Math.random() < 0.3) {
      current = addDays(current, 1);
      continue;
    }

    // vary number of videos per day
    const videosToday = Math.floor(Math.random() * 20) + 1;
    const dayStart = new Date(current);
    dayStart.setHours(Math.random() > 0.5 ? 20 + Math.floor(Math.random() * 4) : 8 + Math.floor(Math.random() * 10));
    dayStart.setMinutes(0);

    for (let i = 0; i < videosToday; i++) {
      dayStart.setTime(dayStart.getTime() + (3 + Math.random() * 20) * 60 * 1000);
      entries.push({
        id: `demo-${entries.length}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        channelName: channels[Math.floor(Math.random() * channels.length)],
        timestamp: new Date(dayStart).toISOString(),
        date: new Date(dayStart)
      });
    }

    current = addDays(current, 1);
  }

  return computeAnalytics(entries);
}

function computeAnalytics(entries: WatchEntry[]): AnalyticsData {
  if (entries.length === 0) {
    return emptyAnalytics();
  }

  const channelCounts = new Map<string, number>();
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  const monthCounts = new Map<string, number>();
  const yearCounts = new Map<string, number>();
  const dayTotalMap = new Map<string, number>();

  let earliestMorning: WatchEntry | null = null;
  let latestNight: WatchEntry | null = null;

  let timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  entries.forEach(entry => {
    channelCounts.set(entry.channelName, (channelCounts.get(entry.channelName) || 0) + 1);

    const h = getHours(entry.date);
    hourCounts[h]++;
    dayCounts[getDay(entry.date)]++;

    const monthKey = format(startOfMonth(entry.date), "MMM yyyy");
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);

    const yearKey = format(startOfYear(entry.date), "yyyy");
    yearCounts.set(yearKey, (yearCounts.get(yearKey) || 0) + 1);

    const dayKey = format(entry.date, "yyyy-MM-dd");
    dayTotalMap.set(dayKey, (dayTotalMap.get(dayKey) || 0) + 1);

    if (h >= 5 && h <= 11) timeSlots.morning++;
    else if (h >= 12 && h <= 16) timeSlots.afternoon++;
    else if (h >= 17 && h <= 21) timeSlots.evening++;
    else timeSlots.night++;

    if (h >= 4 && h <= 11) {
      if (!earliestMorning || h < getHours(earliestMorning.date) ||
        (h === getHours(earliestMorning.date) && entry.date.getMinutes() < earliestMorning.date.getMinutes())) {
        earliestMorning = entry;
      }
    }
    if (h >= 22 || h <= 3) {
      if (!latestNight) {
        latestNight = entry;
      } else {
        const lh = getHours(latestNight.date);
        const adjustedH = h >= 22 ? h : h + 24;
        const adjustedLH = lh >= 22 ? lh : lh + 24;
        if (adjustedH > adjustedLH) latestNight = entry;
      }
    }
  });

  const total = entries.length;

  // Streak calculation
  const dateStart = entries[0].date;
  const dateEnd = entries[entries.length - 1].date;
  const totalDays = differenceInDays(dateEnd, dateStart) + 1;
  const activeDays = dayTotalMap.size;
  const inactiveDays = totalDays - activeDays;

  let longestStreak = 0;
  let currentStreak = 0;
  let streak = 0;
  let prevDate: Date | null = null;

  const sortedDayKeys = Array.from(dayTotalMap.keys()).sort();
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");

  for (const key of sortedDayKeys) {
    if (prevDate === null) {
      streak = 1;
    } else {
      const diff = differenceInDays(new Date(key), prevDate);
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    if (streak > longestStreak) longestStreak = streak;
    prevDate = new Date(key);
  }

  // current streak from today/yesterday
  const lastKey = sortedDayKeys[sortedDayKeys.length - 1];
  if (lastKey === today || lastKey === yesterday) {
    let cs = 1;
    for (let i = sortedDayKeys.length - 2; i >= 0; i--) {
      const diff = differenceInDays(new Date(sortedDayKeys[i + 1]), new Date(sortedDayKeys[i]));
      if (diff === 1) cs++;
      else break;
    }
    currentStreak = cs;
  }

  // Daily activity for heatmap (all days in range)
  const dailyActivity: { date: string; count: number }[] = [];
  let cursor = new Date(dateStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(dateEnd);
  end.setHours(23, 59, 59, 999);
  while (cursor <= end) {
    const key = format(cursor, "yyyy-MM-dd");
    dailyActivity.push({ date: key, count: dayTotalMap.get(key) || 0 });
    cursor = addDays(cursor, 1);
  }

  const topChannels = Array.from(channelCounts.entries())
    .filter(([channel]) => channel && channel !== "Unknown Channel")
    .map(([channel, count]) => ({ channel, count, percentage: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);

  const activityByHour = hourCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count
  }));

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const activityByDay = dayCounts.map((count, i) => ({ day: daysOfWeek[i], count }));

  // Binges
  const binges: BingeSession[] = [];
  let currentBinge: BingeSession | null = null;

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];
    const diffMins = differenceInMinutes(curr.date, prev.date);

    if (diffMins <= 45 && diffMins > 0) {
      if (!currentBinge) {
        currentBinge = {
          startDate: prev.date,
          endDate: curr.date,
          durationMs: curr.date.getTime() - prev.date.getTime(),
          videoCount: 2,
          channels: new Set([prev.channelName, curr.channelName])
        };
      } else {
        currentBinge.endDate = curr.date;
        currentBinge.durationMs = curr.date.getTime() - currentBinge.startDate.getTime();
        currentBinge.videoCount++;
        currentBinge.channels.add(curr.channelName);
      }
    } else {
      if (currentBinge && currentBinge.videoCount >= 4) binges.push(currentBinge);
      currentBinge = null;
    }
  }
  if (currentBinge && currentBinge.videoCount >= 4) binges.push(currentBinge);
  binges.sort((a, b) => b.durationMs - a.durationMs);

  // Most & least active days
  const dayEntries = Array.from(dayTotalMap.entries());
  const mostActiveDayEntry = dayEntries.reduce((a, b) => a[1] > b[1] ? a : b, ["", 0]);
  const leastActiveDayEntry = dayEntries.reduce((a, b) => a[1] < b[1] ? a : b, dayEntries[0] || ["", 0]);

  // Peak hour/day/month
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay = daysOfWeek[dayCounts.indexOf(Math.max(...dayCounts))];
  const monthArr = Array.from(monthCounts.entries());
  const peakMonth = monthArr.length > 0
    ? monthArr.reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : "";

  // Personalities
  const personalities: string[] = [];
  const nightPct = timeSlots.night / total;
  const morningPct = timeSlots.morning / total;
  const weekendPct = (dayCounts[0] + dayCounts[6]) / total;

  if (nightPct > 0.35) personalities.push("The Night Owl");
  if (morningPct > 0.35) personalities.push("The Early Bird");
  if (binges.length > 10) personalities.push("The Binge Watcher");
  if (topChannels[0]?.percentage > 40) personalities.push("The Loyal Fan");
  if (topChannels.length > 0 && topChannels[0]?.percentage < 5) personalities.push("The Variety Seeker");
  if (weekendPct > 0.55) personalities.push("The Weekend Warrior");
  if (personalities.length === 0) personalities.push("The Balanced Viewer");

  return {
    entries,
    totalVideos: total,
    uniqueChannels: channelCounts.size,
    dateRange: { start: dateStart, end: dateEnd },
    totalDays,
    activeDays,
    inactiveDays,
    longestStreak,
    currentStreak,
    avgVideosPerActiveDay: total / activeDays,
    topChannels: topChannels.slice(0, 20),
    activityByHour,
    activityByDay,
    activityByMonth: Array.from(monthCounts.entries()).map(([month, count]) => ({ month, count })),
    activityByYear: Array.from(yearCounts.entries()).map(([year, count]) => ({ year, count })),
    dailyActivity,
    bingeSessions: binges.slice(0, 5),
    longestBinge: binges[0] || null,
    personalities: personalities.slice(0, 3),
    mostActiveDayEver: mostActiveDayEntry[0] ? { date: new Date(mostActiveDayEntry[0]), count: mostActiveDayEntry[1] as number } : null,
    leastActiveDayEver: leastActiveDayEntry && leastActiveDayEntry[0] ? { date: new Date(leastActiveDayEntry[0]), count: leastActiveDayEntry[1] as number } : null,
    earliestMorningWatch: earliestMorning,
    latestNightWatch: latestNight,
    timeSlotPercentages: [
      { slot: "Manhã", percentage: (timeSlots.morning / total) * 100 },
      { slot: "Tarde", percentage: (timeSlots.afternoon / total) * 100 },
      { slot: "Noite", percentage: (timeSlots.evening / total) * 100 },
      { slot: "Madrugada", percentage: (timeSlots.night / total) * 100 },
    ],
    estimatedTotalHours: (total * 5) / 60,
    estimatedTotalDays: (total * 5) / 60 / 24,
    peakHour,
    peakDay,
    peakMonth,
  };
}

function emptyAnalytics(): AnalyticsData {
  const now = new Date();
  return {
    entries: [], totalVideos: 0, uniqueChannels: 0,
    dateRange: { start: now, end: now },
    totalDays: 0, activeDays: 0, inactiveDays: 0,
    longestStreak: 0, currentStreak: 0, avgVideosPerActiveDay: 0,
    topChannels: [], activityByHour: [], activityByDay: [],
    activityByMonth: [], activityByYear: [], dailyActivity: [],
    bingeSessions: [], longestBinge: null, personalities: [],
    mostActiveDayEver: null, leastActiveDayEver: null,
    earliestMorningWatch: null, latestNightWatch: null,
    timeSlotPercentages: [],
    estimatedTotalHours: 0, estimatedTotalDays: 0,
    peakHour: 0, peakDay: "", peakMonth: "",
  };
}
