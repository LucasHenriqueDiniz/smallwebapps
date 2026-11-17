import { describe, expect, it } from "vitest";
import { AD_MARKER, UNKNOWN_CHANNEL, parseJsonHistory } from "@/tools/tubetrace/history";

const watch = (over: Record<string, unknown> = {}) => ({
  header: "YouTube",
  title: "Watched A video",
  titleUrl: "https://www.youtube.com/watch?v=aaa",
  subtitles: [{ name: "Channel A", url: "https://www.youtube.com/channel/a" }],
  time: "2025-06-01T12:00:00.123Z",
  products: ["YouTube"],
  activityControls: ["YouTube watch history"],
  ...over,
});

const parse = (items: unknown[]) => parseJsonHistory(JSON.stringify(items));

describe("parseJsonHistory", () => {
  it("reads a watch event into title, channel, link and time", () => {
    expect(parse([watch()])).toEqual([
      {
        title: "A video",
        channel: "Channel A",
        url: "https://www.youtube.com/watch?v=aaa",
        time: new Date("2025-06-01T12:00:00.123Z"),
      },
    ]);
  });

  it("drops an ad that played as a video", () => {
    const ad = watch({ title: "Watched An ad", details: [{ name: AD_MARKER }] });
    expect(parse([watch(), ad]).map((entry) => entry.title)).toEqual(["A video"]);
  });

  it("drops searches, which carry neither sign", () => {
    const search = {
      title: "Searched for lofi",
      titleUrl: "https://www.youtube.com/results?search_query=lofi",
      time: "2025-06-01T12:00:00Z",
      activityControls: ["YouTube search history"],
    };
    expect(parse([search])).toEqual([]);
  });

  it("keeps a view whose title is not in English, by its link to a video", () => {
    const localized = watch({ title: "Assistiu a Um vídeo", activityControls: ["Histórico do YouTube"] });
    expect(parse([localized])).toHaveLength(1);
  });

  it("counts a removed video under the unknown channel", () => {
    const removed = { title: "Watched a video that has been removed", time: "2025-06-01T12:00:00Z", activityControls: ["YouTube watch history"] };
    expect(parse([removed])[0]).toMatchObject({ channel: UNKNOWN_CHANNEL, url: undefined });
  });

  it("drops community posts and tool use, though Takeout files them under watch history", () => {
    const time = "2025-06-01T12:00:00Z";
    const post = {
      title: "Viewed A post",
      titleUrl: "https://www.youtube.com/post/Ugkx1",
      subtitles: [{ name: "Channel A" }],
      time,
      activityControls: ["YouTube watch history"],
    };
    const shortsTools = { title: "Used Shorts creation tools", time, activityControls: ["YouTube watch history"] };
    expect(parse([post, shortsTools])).toEqual([]);
  });

  it("reads the no-break space the export can put after 'Watched'", () => {
    const removed = { title: "Watched\u00a0a video that has been removed", time: "2025-06-01T12:00:00Z" };
    expect(parse([removed]).map((entry) => entry.title)).toEqual(["a video that has been removed"]);
  });
});
