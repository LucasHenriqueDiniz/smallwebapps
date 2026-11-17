---
tags: [measurement, 2026-11-15-organic-traffic]
measured: 2026-11-17
---

# The owner's Takeout export, counted field by field

Source: `takeout-20261116T235720Z-1-001.zip` (41,089,859 bytes), created 2026-11-16 23:57Z. The
account is set to Portuguese, and the history format was left at the default. Only counts are
recorded here, with no titles, channels or links. Counted with Python regular expressions over the
HTML, run with `python3 -I` from outside the export's folder.
`apps/web/scripts/recap-oracle-html.py` reproduces the view and year counts.

## The archive

| item | value |
|---|---|
| history file | `Takeout/YouTube e YouTube Music/histórico/histórico-de-visualização.html`, 24,274,202 bytes |
| JSON history | none: the format was left at HTML |
| search history | none in the archive |
| other folders | `comentários/`, `inscrições/`, `playlists/`, `canais/`, `chats ao vivo/`, `postagens/`, `metadados do vídeo/`, `music (library and uploads)/` (CSV files), `vídeos/` (the owner's uploads) |

## The entries (one `.outer-cell` each)

| what the HTML shows | maps to (JSON field) | count |
|---|---|---|
| all entries | — | 22,812 |
| header "YouTube" / "YouTube Music" | `header` | 20,079 / 2,733 |
| first word "Watched" / "Viewed" / "Used" | `title` | 22,422 / 389 / 1 |
| "Watched" followed by U+00A0 (no-break space) | `title` | 22,422 of 22,422 |
| first link `www.youtube.com/watch?v=` / `music.youtube.com/watch?v=` / `/post/` / none | `titleUrl` | 19,689 / 2,733 / 385 / 5 |
| watch links with a parameter other than `v` | `titleUrl` | 0 of 22,422 |
| "Watched" entries with a channel link | `subtitles` | 21,993; without one: 328 views and all 101 ads |
| "Produtos: YouTube" | `products` | 22,812 |
| "Detalhes: From Google Ads" | `details` | 103 (101 "Watched", 2 "Viewed") |
| setting "YouTube watch history" | `activityControls` | 22,812; the 103 ads also list "Web & App Activity" |
| date shape `D de mmm. de YYYY, HH:MM:SS BRT` | `time` | 22,812 |
| "Watched" without a link (removed video) | — | 0 |
| years | — | 2025 and 2026 (first entry 2025-05-15) |
