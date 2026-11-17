# Independent oracle for the TubeTrace year recap. Run with TZ set to the browser's zone:
#   TZ=America/Sao_Paulo jq -r -f apps/web/scripts/recap-oracle.jq watch-history.json
# Rule: a view (title starting "Watched", or a link to a YouTube video), minus ads (details
# "From Google Ads"). "YouTube watch history" in activityControls is not a sign: community
# posts carry it too.
def watch: ((.title // "") | test("^Watched\\s"))
  or ((.titleUrl // "") | test("^https://(www\\.|music\\.)?youtube\\.com/watch\\?"));
def ad: ((.details // []) | map(.name) | index("From Google Ads")) != null;
def top5: group_by(.) | map({k: .[0], n: length}) | sort_by(-.n, .k) | .[0:5] | map("\(.k):\(.n)") | join(" | ");
def peak: group_by(.) | map({k: .[0], n: length}) | sort_by(-.n, .k) | .[0] | "\(.k):\(.n)";

[ .[] | select(watch and (ad | not))
  | (.time | sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601) as $t
  | ($t | localtime) as $l
  | { y: ($l | strftime("%Y")), m: ($l | strftime("%m")), w: ($l | strftime("%w")), h: ($l | strftime("%H")),
      t: $t, c: (.subtitles[0].name // "Unknown channel"), u: .titleUrl,
      title: ((.title // "Unknown video") | sub("^Watched\\s+"; "")) } ]
| group_by(.y) | reverse[]
| "\(.[0].y) videos=\(length) channels=\([.[].c] | unique | length)"
  + "\n  top=\([.[].c] | top5)"
  + "\n  rewatched=\([.[] | select(.u) | .u] | group_by(.) | map(select(length > 1)) | length) top=\(map(select(.u)) | group_by(.u) | map(select(length > 1) | {k: (max_by(.t) | .title), n: length}) | sort_by(-.n, .k) | .[0:5] | map("\(.k):\(.n)") | join(" | "))"
  + "\n  month=\([.[].m] | peak) weekday=\([.[].w] | peak) hour=\([.[].h] | peak)"
  + "\n  first=\(min_by(.t) | .title) — \(min_by(.t) | .c)"
