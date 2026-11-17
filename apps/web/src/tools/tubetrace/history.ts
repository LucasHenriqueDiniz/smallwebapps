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
// `\s`, not a plain space: the HTML export puts a no-break space after the word.
const WATCHED_PREFIX = /^Watched\s/;

type TakeoutItem = {
  title?: unknown;
  titleUrl?: unknown;
  subtitles?: { name?: unknown }[];
  time?: unknown;
  time_usec?: unknown;
  details?: { name?: unknown }[];
};

/**
 * The rule both readers share: an entry is a view when its text starts with
 * "Watched" or its link goes to a video. A removed video keeps the prefix and
 * loses the link. Searches have neither: "Searched for", and a /results link.
 *
 * The activity control is deliberately not a sign. Takeout files the community
 * posts an account viewed ("Viewed …", a /post/ link) under "YouTube watch
 * history" too, and a post is not a video.
 */
export function countsAsView(text: string, url: string): boolean {
  return WATCHED_PREFIX.test(text) || WATCH_URL.test(url);
}

export function isWatchEvent(item: TakeoutItem): boolean {
  const title = typeof item.title === "string" ? item.title : "";
  const url = typeof item.titleUrl === "string" ? item.titleUrl : "";
  return countsAsView(title, url);
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
