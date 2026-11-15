import { describe, expect, it } from "vitest";
import type { WatchEntry } from "@/tools/tubetrace/history";
import { recapForYear, stampEntries, yearsIn } from "@/tools/tubetrace/recap";

const view = (time: string, channel: string, url?: string, title = url ?? "removed"): WatchEntry => ({
  title,
  channel,
  url,
  time: new Date(time),
});

describe("yearsIn", () => {
  it("puts a view at 02:30 UTC on 1 January in the previous year in São Paulo, and in its own year in UTC", () => {
    const night = [view("2025-01-01T02:30:00Z", "A", "v1")];
    expect(yearsIn(stampEntries(night, "America/Sao_Paulo"))).toEqual([2024]);
    expect(yearsIn(stampEntries(night, "UTC"))).toEqual([2025]);
  });

  it("offers only years that have a view, newest first", () => {
    const entries = [view("2022-05-01T12:00:00Z", "A", "v1"), view("2024-05-01T12:00:00Z", "A", "v2")];
    expect(yearsIn(stampEntries(entries, "UTC"))).toEqual([2024, 2022]);
  });
});

describe("recapForYear", () => {
  // 2025, UTC. Thursdays: 01-02, 03-06 (twice) and 07-03 = 4 views. 21:00 holds 4.
  const entries = [
    view("2024-12-31T23:00:00Z", "Old", "v0"),
    view("2025-03-06T21:10:00Z", "Alpha", "v1", "Song"),
    view("2025-03-06T21:40:00Z", "Alpha", "v1", "Song"),
    view("2025-03-08T21:05:00Z", "Alpha", "v1", "Song"),
    view("2025-03-08T09:00:00Z", "Beta", "v2", "Talk"),
    view("2025-07-03T21:00:00Z", "Beta", "v2", "Talk"),
    view("2025-01-02T08:00:00Z", "Gamma", "v3", "Clip"),
    view("2025-08-01T10:00:00Z", "Unknown channel"),
  ];
  const recap = recapForYear(stampEntries(entries, "UTC"), 2025)!;

  it("counts the year's views and distinct channels, and nothing from other years", () => {
    expect(recap.videos).toBe(7);
    expect(recap.channels).toBe(4);
  });

  it("ranks channels by views, a tie broken by name", () => {
    expect(recap.topChannels).toEqual([
      { label: "Alpha", count: 3 },
      { label: "Beta", count: 2 },
      { label: "Gamma", count: 1 },
      { label: "Unknown channel", count: 1 },
    ]);
  });

  it("calls a video watched more than once a rewatch, and leaves removed videos out", () => {
    expect(recap.rewatched).toEqual([
      { url: "v1", label: "Song", count: 3 },
      { url: "v2", label: "Talk", count: 2 },
    ]);
  });

  it("finds the busiest month, weekday and hour, and the first view of the year", () => {
    expect(recap.busiestMonth).toEqual({ month: 2, label: "March", count: 4 });
    expect(recap.busiestWeekday).toEqual({ weekday: 4, label: "Thursday", count: 4 });
    expect(recap.peakHour).toEqual({ hour: 21, count: 4 });
    expect(recap.firstVideo.title).toBe("Clip");
  });

  it("names a rewatched video by its most recent title", () => {
    const renamed = [
      view("2025-05-01T10:00:00Z", "A", "v9", "Old name"),
      view("2025-05-03T10:00:00Z", "A", "v9", "New name"),
      view("2025-05-02T10:00:00Z", "A", "v9", "Middle name"),
    ];
    expect(recapForYear(stampEntries(renamed, "UTC"), 2025)!.rewatched).toEqual([
      { url: "v9", label: "New name", count: 3 },
    ]);
  });

  it("returns nothing for a year without views", () => {
    expect(recapForYear(stampEntries(entries, "UTC"), 2023)).toBeNull();
  });
});
