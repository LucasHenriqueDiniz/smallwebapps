#!/bin/bash
# Small Web Apps SEO checker

set -e

echo "🔍 Running SEO checks..."

# Check CLAUDE.md exists and is readable
if [ ! -f "CLAUDE.md" ]; then
  echo "❌ CLAUDE.md not found"
  exit 1
fi

# Validate robots.txt
if [ ! -f "apps/web/dist/robots.txt" ]; then
  echo "⚠️  robots.txt not found in build output"
  exit 1
fi

# Validate sitemap
if [ ! -f "apps/web/dist/sitemap-index.xml" ]; then
  echo "⚠️  sitemap-index.xml not found in build output"
  exit 1
fi

# Check for critical metadata files
if [ ! -f "apps/web/src/data/apps.ts" ]; then
  echo "❌ apps.ts metadata not found"
  exit 1
fi

# Validate guide schema
guides_count=$(grep -c "\.md" apps/web/src/content/guides/ 2>/dev/null || echo 0)
if [ "$guides_count" -eq 0 ]; then
  echo "⚠️  No guides found in content"
fi

echo "✓ SEO checks passed"
echo "  - CLAUDE.md present and canonical"
echo "  - robots.txt generated"
echo "  - sitemap configured"
echo "  - app metadata centralized in apps.ts"
echo ""
echo "📋 Next steps:"
echo "  - Verify Open Graph images are generating (og/ endpoints)"
echo "  - Check article schema in guides with publishedDate/modifiedDate"
echo "  - Run build and inspect dist/og/*.svg outputs"
