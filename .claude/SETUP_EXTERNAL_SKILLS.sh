#!/bin/bash
# Setup external skills for Small Web Apps

set -e

echo "🚀 Installing professional SEO and AdSense skills..."
echo ""

# Create skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# 1. Install Claude SEO
echo "📋 Installing Claude SEO..."
if [ ! -d ~/.claude/skills/claude-seo ]; then
  git clone https://github.com/AgricIDaniel/claude-seo.git ~/.claude/skills/claude-seo
  echo "✓ Claude SEO installed"
else
  echo "⚠ Claude SEO already installed (skipping)"
fi

echo ""

# 2. Install AdSense Site Auditor
echo "💰 Installing AdSense Site Auditor..."
if [ ! -d ~/.claude/skills/adsense-site-auditor ]; then
  git clone https://github.com/LucasHenriqueDiniz/adsense-site-auditor.git ~/.claude/skills/adsense-site-auditor
  echo "✓ AdSense Site Auditor installed"
else
  echo "⚠ AdSense Site Auditor already installed (skipping)"
fi

echo ""

# 3. Optional: Install Python dependencies for AdSense helper scripts
echo "🐍 Installing optional Python dependencies..."
python3 -m pip install requests --quiet 2>/dev/null || echo "⚠ Skipping (requests may already be installed)"

echo ""
echo "=========================================="
echo "✓ Installation complete!"
echo "=========================================="
echo ""
echo "Available commands in Claude Code:"
echo "  /seo audit"
echo "  /adsense-site-auditor"
echo ""
echo "See .claude/EXTERNAL_SKILLS.md for usage."
echo ""
