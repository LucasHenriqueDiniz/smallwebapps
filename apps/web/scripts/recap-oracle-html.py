"""Independent oracle for the TubeTrace year recap, over a Takeout HTML export.

Shares no code with the page. Run it with -I so nothing next to the export is imported:

    python3 -I apps/web/scripts/recap-oracle-html.py "<path>/watch-history.html"

Rule, the one the page states: an entry counts when its text begins with "Watched" or its first
link is a YouTube video; an entry whose box carries "From Google Ads" is dropped. Times are the
wall-clock time Takeout printed, which is the browser's zone when the account and the browser
share it (the check below assumes they do).
"""
import collections
import html
import re
import sys

MONTHS = {
    "jan": 1, "feb": 2, "fev": 2, "mar": 3, "apr": 4, "abr": 4, "may": 5, "mai": 5, "jun": 6,
    "jul": 7, "aug": 8, "ago": 8, "sep": 9, "set": 9, "oct": 10, "out": 10, "nov": 11, "dec": 12,
    "dez": 12,
}
VIDEO_LINK = re.compile(r"^https://(www\.|music\.)?youtube\.com/watch\?")
PT_DATE = re.compile(r"(\d{1,2}) de ([a-z]{3})\.? de (\d{4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?")
EN_DATE = re.compile(r"([A-Z][a-z]{2}) (\d{1,2}), (\d{4}), (\d{1,2}):(\d{2}):(\d{2})\s*([AP]M)?")


def wall_clock(text):
    m = PT_DATE.search(text)
    if m:
        d, mon, y, hh, mm, ss = m.groups()
        return int(y), MONTHS[mon], int(d), int(hh), int(mm), int(ss or 0)
    m = EN_DATE.search(text)
    if m:
        mon, d, y, hh, mm, ss, ampm = m.groups()
        h = int(hh) % 12 + (12 if ampm == "PM" else 0) if ampm else int(hh)
        return int(y), MONTHS[mon.lower()], int(d), h, int(mm), int(ss)
    return None


def entries(path):
    text = open(path, encoding="utf-8").read()
    for box in text.split('class="outer-cell')[1:]:
        body = re.search(r'mdl-typography--body-1">(.*?)</div>', box, re.S).group(1)
        links = re.findall(r'<a href="([^"]+)">(.*?)</a>', body)
        plain = html.unescape(re.sub(r"<[^>]+>", "", body))
        watched = re.match(r"Watched\s", plain) is not None
        video = bool(links) and VIDEO_LINK.match(html.unescape(links[0][0])) is not None
        if not (watched or video) or "From Google Ads" in box:
            continue
        parts = [html.unescape(p).strip() for p in re.split(r"<br>", body)]
        when = next((wall_clock(p) for p in reversed(parts) if re.search(r"\d{4}", p)), None)
        if when is None:
            continue
        channel = html.unescape(links[1][1]).strip() if len(links) > 1 else "Unknown channel"
        yield when, channel


def main(path):
    by_year = collections.defaultdict(list)
    total = 0
    for when, channel in entries(path):
        by_year[when[0]].append(channel)
        total += 1
    print(f"entries counted: {total}")
    for year in sorted(by_year, reverse=True):
        channels = collections.Counter(by_year[year])
        top = sorted(channels.items(), key=lambda kv: (-kv[1], kv[0]))[:5]
        print(f"{year} videos={len(by_year[year])} channels={len(channels)}")
        print("  top=" + " | ".join(f"{k}:{n}" for k, n in top))


if __name__ == "__main__":
    main(sys.argv[1])
