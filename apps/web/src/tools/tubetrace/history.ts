/**
 * Reading Google Takeout's watch-history.json into watch entries.
 *
 * Pure: no DOM, so it runs under vitest. The HTML export needs DOMParser and is
 * read in the component instead.
 *
 * What counts as a view is stated on the tool page and in the guide
 * `why-youtube-watch-counts-differ`; change all three together.
 */

export type WatchEntry = {
  title: string;
  channel: string;
  url?: string;
  time: Date;
};

export const UNKNOWN_CHANNEL = "Unknown channel";

/** The `details` name Takeout writes on an ad that played as a video. */
export const AD_MARKER = "From Google Ads";

const WATCH_URL = /^https:\/\/(www\.|music\.)?youtube\.com\/watch\?/;

type TakeoutItem = {
  title?: unknown;
  titleUrl?: unknown;
  subtitles?: { name?: unknown }[];
  time?: unknown;
  time_usec?: unknown;
  activityControls?: unknown;
  details?: { name?: unknown }[];
};

/**
 * A watch event, by any of three signs: the English title prefix, the
 * activity control that recorded it, or a link to a video. The link is the one
 * sign that does not depend on the account's language. Searches match none of
 * them: their title starts "Searched for" and their link goes to /results.
 */
export function isWatchEvent(item: TakeoutItem): boolean {
  const title = typeof item.title === "string" ? item.title : "";
  const controls = Array.isArray(item.activityControls) ? item.activityControls : [];
  const url = typeof item.titleUrl === "string" ? item.titleUrl : "";
  return title.startsWith("Watched ") || controls.includes("YouTube watch history") || WATCH_URL.test(url);
}

export function isAd(item: TakeoutItem): boolean {
  return Array.isArray(item.details) && item.details.some((detail) => detail?.name === AD_MARKER);
}

function timeOf(item: TakeoutItem): Date | null {
  const date =
    typeof item.time === "string"
      ? new Date(item.time)
      : typeof item.time_usec === "number" || typeof item.time_usec === "string"
        ? new Date(Number(item.time_usec) / 1000)
        : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function parseJsonHistory(text: string): WatchEntry[] {
  const data = JSON.parse(text);
  const items: TakeoutItem[] = Array.isArray(data) ? data : data?.BrowserHistory || [];
  const entries: WatchEntry[] = [];

  for (const item of items) {
    if (!item || !isWatchEvent(item) || isAd(item)) continue;
    const time = timeOf(item);
    if (!time) continue;
    const name = item.subtitles?.[0]?.name;
    entries.push({
      title: String(item.title || "Unknown video").replace(/^Watched\s+/, ""),
      channel: typeof name === "string" && name ? name : UNKNOWN_CHANNEL,
      url: typeof item.titleUrl === "string" ? item.titleUrl : undefined,
      time,
    });
  }

  return entries;
}
