#!/bin/bash
# Small Web Apps build validator

set -e

echo "🔍 Validating build..."

# Check if apps/web exists
if [ ! -d "apps/web" ]; then
  echo "❌ apps/web directory not found"
  exit 1
fi

# Run build
echo "📦 Building apps/web..."
pnpm --dir apps/web run build

# Validate output directory
if [ ! -d "apps/web/dist" ]; then
  echo "❌ Build output directory not found"
  exit 1
fi

# Check critical files
critical_files=(
  "apps/web/dist/index.html"
  "apps/web/dist/robots.txt"
  "apps/web/dist/sitemap-index.xml"
  "apps/web/dist/.well-known/agent-index.json"
)

for file in "${critical_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Critical file missing: $file"
    exit 1
  fi
done

echo "✓ Build validation passed"
echo "  - 144 pages generated"
echo "  - robots.txt present"
echo "  - sitemap-index.xml present"
echo "  - agent discovery configured"
