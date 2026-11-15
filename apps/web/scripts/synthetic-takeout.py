"""Synthetic watch-history.json shaped like a Takeout export, seeded.

Covers what the recap has to get right: ads (details "From Google Ads"), YouTube
Music, removed videos, a non-English title with a watch link, search entries,
rewatches, non-ASCII channel names, fractional and whole-second timestamps, and
views in the first hours of 1 January UTC. Newest first, as Takeout writes it.

usage: python3 -I apps/web/scripts/synthetic-takeout.py <out.json>
"""
import datetime as dt
import json
import random
import sys
import zlib

rng = random.Random(20261115)
channels = [f"Channel {i:02d}" for i in range(50)] + ["Canal Ação", "日本チャンネル", "Ünïcode Talks", "Zeta"]
weights = [1 / (i + 1) ** 0.9 for i in range(len(channels))]
videos = {c: [f"{c} video {j}" for j in range(25)] for c in channels}
start = dt.datetime(2022, 11, 20, tzinfo=dt.timezone.utc)
end = dt.datetime(2026, 11, 12, tzinfo=dt.timezone.utc)
span = (end - start).total_seconds()


def stamp(t: dt.datetime) -> str:
    if rng.random() < 0.5:
        return t.strftime("%Y-%m-%dT%H:%M:%S.") + f"{rng.randint(0, 999):03d}Z"
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


def vid(title: str) -> str:
    return "v" + str(zlib.crc32(title.encode()))


items = []
times = [start + dt.timedelta(seconds=rng.random() * span) for _ in range(6000)]
# Views around midnight UTC on New Year's Day: previous year in the Americas.
for year in (2023, 2024, 2025, 2026):
    for minute in (5, 47, 130, 170):
        times.append(dt.datetime(year, 1, 1, tzinfo=dt.timezone.utc) + dt.timedelta(minutes=minute))

for t in times:
    roll = rng.random()
    if roll < 0.03:  # ad
        items.append({"header": "YouTube", "title": "Watched Buy Our Product", "titleUrl": "https://www.youtube.com/watch?v=ad" + str(rng.randint(1, 40)),
                      "time": stamp(t), "products": ["YouTube"], "details": [{"name": "From Google Ads"}],
                      "activityControls": ["Web & App Activity", "YouTube watch history", "YouTube search history"]})
        continue
    if roll < 0.05:  # removed
        items.append({"header": "YouTube", "title": "Watched a video that has been removed", "time": stamp(t),
                      "products": ["YouTube"], "activityControls": ["YouTube watch history"]})
        continue
    if roll < 0.07:  # search, as in a combined MyActivity export
        items.append({"header": "YouTube", "title": "Searched for lofi beats", "titleUrl": "https://www.youtube.com/results?search_query=lofi+beats",
                      "time": stamp(t), "products": ["YouTube"], "activityControls": ["YouTube search history"]})
        continue
    channel = rng.choices(channels, weights)[0]
    title = rng.choices(videos[channel], [1 / (k + 1) ** 1.2 for k in range(25)])[0]
    music = roll < 0.12
    localized = 0.12 <= roll < 0.13
    items.append({
        "header": "YouTube Music" if music else "YouTube",
        "title": ("Assistiu a " if localized else "Watched ") + title,
        "titleUrl": ("https://music.youtube.com/watch?v=" if music else "https://www.youtube.com/watch?v=") + vid(title),
        "subtitles": [{"name": channel, "url": "https://www.youtube.com/channel/" + vid(channel)}],
        "time": stamp(t),
        "products": ["YouTube"],
        "activityControls": ["Histórico do YouTube"] if localized else ["YouTube watch history"],
    })

items.sort(key=lambda i: i["time"], reverse=True)
json.dump(items, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
print(len(items), "entries")
