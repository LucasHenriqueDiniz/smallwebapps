#!/usr/bin/env bash
#
# dark-mode-validator.sh — fail when a tool uses a light-mode Tailwind class
# that has no dark counterpart.
#
# The React tools are written against Tailwind's light palette. Dark mode is a
# block of [data-theme="dark"] overrides in src/styles/global.css, and a class
# with no rule there renders its light value on a near-black page. Nothing
# catches it: the build passes, the page loads, and a near-white panel sits on
# rgb(15,17,23) until someone happens to look. `bg-blue-50` did exactly that.
#
# This turns that silence into a failure. It collects the classes the tools
# actually use, keeps the ones that encode a light SURFACE, a light BORDER or
# dark-on-light TEXT, and checks each has a rule in the dark block.
#
# Two things are deliberately exempt. Saturated fills at 500 and up
# (`bg-blue-600` with `text-white`) are buttons and read correctly in both
# themes. Saturated TEXT at 400 and 500 is already bright enough for a dark
# page — text-emerald-400 is #34d399 — so only 600 and darker is asked for.
# The neutral ramp has no such exemption: greys carry the copy and all of it
# has to flip.
#
# Usage: ./.claude/skills/dark-mode-validator.sh
# Exit:  0 all used light-surface classes are covered; 1 otherwise.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOOLS_DIR="$ROOT/apps/web/src/tools"
CSS="$ROOT/apps/web/src/styles/global.css"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; NC='\033[0m'

echo "🌗 Dark Mode Coverage"
echo "---------------------"

[ -d "$TOOLS_DIR" ] || { echo -e "${RED}✗${NC} tools directory not found: $TOOLS_DIR"; exit 1; }
[ -f "$CSS" ]       || { echo -e "${RED}✗${NC} stylesheet not found: $CSS"; exit 1; }

# Classes that need a dark rule, in three groups:
#
#   1. light fills and hairlines, any hue, shades 50..300 — these are built to
#      sit on white and cannot survive inversion;
#   2. the NEUTRAL text ramp from 400 up — greys carry the copy, and the whole
#      ramp has to flip;
#   3. SATURATED text from 600 up — an accent that dark. At 400 and 500 a
#      saturated hue (text-emerald-400 is #34d399) is already bright enough to
#      read on a dark page, so it is exempt.
NEUTRALS='slate|gray|zinc|neutral|stone'
HUES='blue|sky|indigo|violet|purple|fuchsia|pink|emerald|green|teal|cyan|lime|red|rose|amber|yellow|orange'
NEEDS_RULE="\\b(bg-white|(bg|border|divide|ring)-($NEUTRALS|$HUES)-(50|100|200|300)|text-($NEUTRALS)-(400|500|600|700|800|900|950)|text-($HUES)-(600|700|800|900|950))\\b"

# tubetrace/native/ is unreachable code the site never serves (see CLAUDE.md);
# holding it to the theme contract would only produce noise.
used="$(grep -rhoE "$NEEDS_RULE" "$TOOLS_DIR" --include='*.tsx' --include='*.ts' \
        --exclude-dir=native 2>/dev/null | sort -u)"

if [ -z "$used" ]; then
  echo -e "${YELLOW}!${NC} no themed utility classes found in tools — nothing to check"
  exit 0
fi

# Rules present in the dark block. Tailwind escapes the colon in variant class
# names (focus\:ring-blue-200), so strip the escape, then the leading variant
# and any trailing pseudo-class, leaving the bare utility name to compare.
covered="$(grep -oE '\[data-theme="dark"\][^{]*' "$CSS" \
  | grep -oE '\.[A-Za-z0-9\\:_-]+' \
  | sed -e 's/^\.//' -e 's/\\//g' -e 's/^[a-z]*://' -e 's/:[a-z-]*$//' \
  | sort -u)"

missing=""
checked=0
for class in $used; do
  checked=$((checked + 1))
  grep -qxF "$class" <<< "$covered" || missing="$missing $class"
done

if [ -n "$missing" ]; then
  echo -e "${RED}✗${NC} $(wc -w <<< "$missing" | tr -d ' ') class(es) used in tools with no [data-theme=\"dark\"] rule:"
  for class in $missing; do
    where="$(grep -rlE "\b${class//\\/}\b" "$TOOLS_DIR" --include='*.tsx' --exclude-dir=native 2>/dev/null | head -3 \
             | sed "s|$TOOLS_DIR/||" | tr '\n' ' ')"
    printf '    %-24s %s\n' "$class" "$where"
  done
  echo ""
  echo "  Add a rule for each in apps/web/src/styles/global.css, in the dark block."
  echo "  A class with no rule renders its light value on a dark page, silently."
  exit 1
fi

echo -e "${GREEN}✓${NC} all $checked light-surface classes used in tools have a dark rule"

# Dead rules are not a failure, but they are how the ring override drifted:
# the block named ring-orange-200 while every tool ringed on blue.
dead=""
for class in $covered; do
  case "$class" in
    bg-white|card-surface|*search*|*modal*) continue ;;
  esac
  grep -qE "\b$class\b" -r "$TOOLS_DIR" --include='*.tsx' 2>/dev/null || dead="$dead $class"
done
[ -n "$dead" ] && echo -e "${YELLOW}!${NC} rules for classes no tool uses (safe to delete):$dead"

echo ""
echo "======================================"
echo -e "${GREEN}✓ Dark mode coverage is complete${NC}"
echo "======================================"
