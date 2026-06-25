import { useEffect, useMemo, useState } from "react";
import { gunzipSync, unzipSync } from "fflate";

type WatchEntry = {
  title: string;
  channel: string;
  url?: string;
  time: Date;
};

type Analysis = {
  entries: WatchEntry[];
  topChannels: { channel: string; count: number; percentage: number }[];
  byHour: number[];
  byDay: number[];
  byMonth: { month: string; count: number }[];
  firstDate: Date;
  lastDate: Date;
  uniqueChannels: number;
};

const MAX_ARCHIVE_BYTES = 300 * 1024 * 1024;
const textDecoder = new TextDecoder("utf-8");
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthMap: Record<string, number> = {
  jan: 0,
  fev: 1,
  feb: 1,
  mar: 2,
  abr: 3,
  apr: 3,
  mai: 4,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  aug: 7,
  set: 8,
  sep: 8,
  out: 9,
  oct: 9,
  nov: 10,
  dez: 11,
  dec: 11,
};

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function chartWidth(value: number, max: number, ready: boolean) {
  if (!ready || max <= 0 || value <= 0) return "0%";
  return `${Math.max((value / max) * 100, 4)}%`;
}

function chartHeight(value: number, max: number, ready: boolean) {
  if (!ready || max <= 0 || value <= 0) return "4px";
  return `${Math.max((value / max) * 100, 8)}%`;
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
  );
}

function scoreHistoryCandidate(path: string, preview: string) {
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

function readTarString(bytes: Uint8Array, start: number, length: number) {
  const slice = bytes.slice(start, start + length);
  const end = slice.indexOf(0);
  return textDecoder.decode(end >= 0 ? slice.slice(0, end) : slice).trim();
}

function readTarEntries(bytes: Uint8Array) {
  const entries: { path: string; bytes: Uint8Array }[] = [];
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    const header = bytes.slice(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;

    const path = readTarString(header, 0, 100);
    const prefix = readTarString(header, 345, 155);
    const fullPath = prefix ? `${prefix}/${path}` : path;
    const size = parseInt(readTarString(header, 124, 12) || "0", 8);
    const typeFlag = String.fromCharCode(header[156] || 0);
    const dataStart = offset + 512;

    if (fullPath && typeFlag !== "5" && size > 0) {
      entries.push({ path: fullPath, bytes: bytes.slice(dataStart, dataStart + size) });
    }

    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  return entries;
}

function pickHistoryFile(candidates: { path: string; bytes: Uint8Array }[]) {
  const scored = candidates
    .filter(({ path, bytes }) => /\.(json|html?)$/i.test(path) && bytes.length > 0)
    .map(({ path, bytes }) => {
      const preview = textDecoder.decode(bytes.slice(0, 32768)).toLowerCase();
      return { path, bytes, score: scoreHistoryCandidate(path, preview) };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) throw new Error("No YouTube watch history file was found in this archive.");

  return { name: best.path, text: textDecoder.decode(best.bytes) };
}

async function resolveHistoryFile(file: File) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".json") || name.endsWith(".html")) {
    return { name: file.name, text: await file.text() };
  }

  if (file.size > MAX_ARCHIVE_BYTES) {
    throw new Error("This archive is too large for a browser tab. Try exporting only YouTube watch history.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (name.endsWith(".zip")) {
    return pickHistoryFile(Object.entries(unzipSync(bytes)).map(([path, fileBytes]) => ({ path, bytes: fileBytes })));
  }

  if (name.endsWith(".tgz") || name.endsWith(".tar.gz")) {
    return pickHistoryFile(readTarEntries(gunzipSync(bytes)));
  }

  throw new Error("Use a Google Takeout .zip, .tgz, watch-history.json, or watch-history.html file.");
}

function parseDateText(value: string) {
  const trimmed = value.replace(/\s+/g, " ").replace(/\b(BRT|BRST|UTC)\b/g, "").trim();
  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  const match = trimmed.match(/(\d{1,2})\s+de\s+([a-zA-Z.]+)\s+de\s+(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i);
  if (match) {
    const [, day, monthText, year, hour, minute, second = "0"] = match;
    const month = monthMap[monthText.toLowerCase().replace(".", "").slice(0, 3)] ?? 0;
    return new Date(Number(year), month, Number(day), Number(hour), Number(minute), Number(second));
  }

  return null;
}

function parseJsonHistory(text: string) {
  const data = JSON.parse(text);
  const items = Array.isArray(data) ? data : data.BrowserHistory || [];

  return items
    .filter((item: any) => {
      const title = String(item.title || "");
      const controls = Array.isArray(item.activityControls) ? item.activityControls.join(" ") : "";
      return title.startsWith("Watched ") || controls.includes("YouTube watch history");
    })
    .map((item: any) => {
      const date = new Date(item.time || item.time_usec / 1000);
      if (Number.isNaN(date.getTime())) return null;
      return {
        title: String(item.title || "Unknown video").replace(/^Watched\s+/, ""),
        channel: item.subtitles?.[0]?.name || "Unknown channel",
        url: item.titleUrl,
        time: date,
      };
    })
    .filter(Boolean) as WatchEntry[];
}

function parseHtmlHistory(text: string) {
  const doc = new DOMParser().parseFromString(text, "text/html");
  const entries: WatchEntry[] = [];

  doc.querySelectorAll(".content-cell").forEach((cell) => {
    const cellText = cell.textContent?.trim() || "";
    if (!/^Watched\s/i.test(cellText)) return;

    const links = Array.from(cell.querySelectorAll("a"));
    const videoLink = links.find((link) => link.href.includes("watch?v=")) || links[0];
    const channelLink =
      links.find((link) => /\/(channel|user|@)/.test(link.getAttribute("href") || "")) ||
      links.find((link) => link !== videoLink);

    let dateText = "";
    cell.childNodes.forEach((node) => {
      const value = node.textContent?.trim() || "";
      if (node.nodeType === Node.TEXT_NODE && /\d{4}/.test(value)) dateText = value;
    });

    const time = parseDateText(dateText);
    if (!time) return;

    entries.push({
      title: videoLink?.textContent?.trim() || cellText.replace(/^Watched\s+/, "").trim() || "Unknown video",
      channel: channelLink?.textContent?.trim() || "Unknown channel",
      url: videoLink?.getAttribute("href") || undefined,
      time,
    });
  });

  return entries;
}

function analyze(entries: WatchEntry[]): Analysis {
  const sorted = [...entries].sort((a, b) => a.time.getTime() - b.time.getTime());
  const channelCounts = new Map<string, number>();
  const monthCounts = new Map<string, number>();
  const byHour = new Array(24).fill(0);
  const byDay = new Array(7).fill(0);

  sorted.forEach((entry) => {
    channelCounts.set(entry.channel, (channelCounts.get(entry.channel) || 0) + 1);
    byHour[entry.time.getHours()] += 1;
    byDay[entry.time.getDay()] += 1;
    const month = new Intl.DateTimeFormat("en", { month: "short", year: "2-digit" }).format(entry.time);
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  });

  return {
    entries: sorted,
    byHour,
    byDay,
    byMonth: Array.from(monthCounts.entries()).map(([month, count]) => ({ month, count })).slice(-12),
    firstDate: sorted[0].time,
    lastDate: sorted[sorted.length - 1].time,
    uniqueChannels: channelCounts.size,
    topChannels: Array.from(channelCounts.entries())
      .map(([channel, count]) => ({ channel, count, percentage: (count / sorted.length) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}

async function parseFile(file: File) {
  const historyFile = await resolveHistoryFile(file);
  const entries = historyFile.name.toLowerCase().endsWith(".json")
    ? parseJsonHistory(historyFile.text)
    : parseHtmlHistory(historyFile.text);

  if (entries.length === 0) {
    throw new Error("No watch entries were found. Make sure the file contains YouTube watch history.");
  }

  return analyze(entries);
}

export default function YouTubeWatchHistoryAnalyzerApp() {
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  const peakHour = useMemo(() => {
    if (!analysis) return null;
    const count = Math.max(...analysis.byHour);
    return { hour: analysis.byHour.indexOf(count), count };
  }, [analysis]);

  const peakDay = useMemo(() => {
    if (!analysis) return null;
    const count = Math.max(...analysis.byDay);
    return { day: dayLabels[analysis.byDay.indexOf(count)], count };
  }, [analysis]);

  const hourMax = useMemo(() => Math.max(...(analysis?.byHour || [0])), [analysis]);
  const dayMax = useMemo(() => Math.max(...(analysis?.byDay || [0])), [analysis]);
  const monthMax = useMemo(() => Math.max(...(analysis?.byMonth.map((item) => item.count) || [0])), [analysis]);
  const recentEntries = useMemo(() => analysis?.entries.slice(-5).reverse() || [], [analysis]);

  useEffect(() => {
    if (!analysis) {
      setChartReady(false);
      return;
    }

    setChartReady(false);
    const frame = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(frame);
  }, [analysis]);

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setFileName(file.name);
    setAnalysis(null);

    try {
      setAnalysis(await parseFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this file.");
    } finally {
      setBusy(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">YouTube / Data</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-950">Watch history snapshot</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Read a Google Takeout watch history file locally and get a quick summary of channels,
            dates, and viewing patterns. Nothing is uploaded.
          </p>
        </div>

        <label
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
            dragActive
              ? "border-red-400 bg-red-50"
              : "border-slate-300 bg-slate-50 hover:border-red-300 hover:bg-red-50/40"
          }`}
        >
          <input
            type="file"
            accept=".zip,.tgz,.tar.gz,.gz,.json,.html,application/zip,application/json,text/html"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-sm font-extrabold text-red-600">
            {busy ? <Spinner /> : "YT"}
          </span>
          <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
            {busy && <Spinner />}
            {busy ? "Reading Takeout file..." : dragActive ? "Drop the archive here" : "Choose or drop Takeout file"}
          </span>
          <span className="mt-1 text-xs text-slate-500">ZIP, TGZ, JSON, or HTML watch history</span>
          {fileName && <span className="mt-3 max-w-full truncate text-xs font-medium text-slate-600">{fileName}</span>}
        </label>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          ZIP support is still enabled. The archive is opened locally only to find
          watch-history.json or watch-history.html from Google Takeout.
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Videos</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {analysis ? formatNumber(analysis.entries.length) : "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Channels</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {analysis ? formatNumber(analysis.uniqueChannels) : "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Peak time</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {peakHour ? `${String(peakHour.hour).padStart(2, "0")}:00` : "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Quick insights</h3>
          {analysis ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">Date range</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDate(analysis.firstDate)} to {formatDate(analysis.lastDate)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">Most active day</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {peakDay ? `${peakDay.day} (${formatNumber(peakDay.count)} videos)` : "-"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Select a Takeout file to see summary metrics here.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Top channels</h3>
          <div className="mt-4 space-y-3">
            {(analysis?.topChannels.length ? analysis.topChannels : [{ channel: "Waiting for file", count: 0, percentage: 0 }]).map((item) => (
              <div key={item.channel}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-slate-800">{item.channel}</span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {item.count ? formatNumber(item.count) : "-"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-700 ease-out"
                    style={{ width: chartWidth(item.percentage, 100, chartReady || !analysis) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">Activity by hour</h3>
            {peakHour && <span className="text-xs font-semibold text-slate-500">Peak: {String(peakHour.hour).padStart(2, "0")}:00</span>}
          </div>
          <div className="mt-5 flex h-36 items-end gap-1 rounded-xl bg-slate-50 p-3">
            {(analysis?.byHour || new Array(24).fill(0)).map((count, hour) => (
              <div key={hour} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <div
                  className="rounded-t bg-red-500/80 transition-all duration-700 ease-out"
                  style={{ height: chartHeight(count, hourMax, chartReady) }}
                  title={`${String(hour).padStart(2, "0")}:00 - ${formatNumber(count)} videos`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-950">Days of week</h3>
            <div className="mt-4 space-y-3">
              {(analysis?.byDay || new Array(7).fill(0)).map((count, index) => (
                <div key={dayLabels[index]} className="grid grid-cols-[38px_1fr_56px] items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-500">{dayLabels[index]}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-700 ease-out"
                      style={{ width: chartWidth(count, dayMax, chartReady) }}
                    />
                  </div>
                  <span className="text-right text-xs font-semibold text-slate-500">
                    {count ? formatNumber(count) : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-950">Recent months</h3>
            <div className="mt-4 space-y-3">
              {(analysis?.byMonth.length ? analysis.byMonth : [{ month: "Waiting", count: 0 }]).map((item) => (
                <div key={item.month} className="grid grid-cols-[58px_1fr_56px] items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-500">{item.month}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-700 ease-out"
                      style={{ width: chartWidth(item.count, monthMax, chartReady) }}
                    />
                  </div>
                  <span className="text-right text-xs font-semibold text-slate-500">
                    {item.count ? formatNumber(item.count) : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {recentEntries.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-950">Recent entries</h3>
            <div className="mt-4 divide-y divide-slate-100">
              {recentEntries.map((entry, index) => (
                <div key={`${entry.title}-${entry.time.toISOString()}-${index}`} className="grid gap-1 py-3 first:pt-0 last:pb-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{entry.title}</p>
                  <p className="text-xs text-slate-500">
                    {entry.channel} - {formatDate(entry.time)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
