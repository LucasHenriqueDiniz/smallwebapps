#!/bin/bash
# Small Web Apps SEO + AdSense Validator

set -e

echo "🔍 SEO + AdSense Comprehensive Check"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

failed=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  failed=$((failed + 1))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# ===================
# 1. ADSENSE FILES
# ===================
echo "📋 AdSense Configuration"
echo "------------------------"

if [ -f "apps/web/public/ads.txt" ]; then
  adsense_id=$(grep -oP 'pub-\d+' apps/web/public/ads.txt 2>/dev/null || echo "NOT_FOUND")
  if [ "$adsense_id" != "NOT_FOUND" ]; then
    check_pass "ads.txt present with AdSense ID ($adsense_id)"
  else
    check_fail "ads.txt exists but missing AdSense ID"
  fi
else
  check_fail "ads.txt missing (required for AdSense verification)"
fi

# Check AdSenseHead component
if grep -q "AdSenseHead" apps/web/src/components/layout/MainLayout.astro; then
  check_pass "AdSenseHead imported in MainLayout"
else
  check_fail "AdSenseHead not found in MainLayout"
fi

if grep -q "PUBLIC_ADSENSE_CLIENT" apps/web/src/components/site/AdSenseHead.astro; then
  check_pass "AdSenseHead correctly configured with env var"
else
  check_fail "AdSenseHead missing PUBLIC_ADSENSE_CLIENT env var"
fi

# ===================
# 2. CONSENT MODE
# ===================
echo ""
echo "🔐 Google Consent Mode v2"
echo "------------------------"

if grep -q "Google Consent Mode" apps/web/src/components/layout/MainLayout.astro; then
  check_pass "Consent Mode v2 script present"
else
  check_fail "Consent Mode v2 script missing"
fi

if grep -q "ad_storage.*denied" apps/web/src/components/layout/MainLayout.astro; then
  check_pass "Consent defaults to DENIED (privacy-first)"
else
  check_fail "Consent defaults not privacy-first"
fi

if grep -q "swa_consent" apps/web/src/components/layout/MainLayout.astro; then
  check_pass "Consent choice persistence implemented"
else
  check_fail "Consent choice persistence missing"
fi

# ===================
# 3. SECURITY HEADERS
# ===================
echo ""
echo "🔒 Security Headers (CSP)"
echo "------------------------"

if grep -q "Content-Security-Policy" apps/web/public/_headers; then
  check_pass "_headers contains CSP"

  # Check CSP allows AdSense
  if grep "Content-Security-Policy" apps/web/public/_headers | grep -q "pagead2.googlesyndication.com"; then
    check_pass "CSP whitelists pagead2.googlesyndication.com"
  else
    check_warn "CSP may not whitelist AdSense domain (script-src must allow https:)"
  fi

  # Check CSP allows Google Fonts
  if grep "Content-Security-Policy" apps/web/public/_headers | grep -q "fonts.googleapis.com"; then
    check_pass "CSP whitelists Google Fonts"
  else
    check_warn "CSP may restrict Google Fonts"
  fi
else
  check_fail "CSP not found in _headers"
fi

# ===================
# 4. DARK MODE COMPAT
# ===================
echo ""
echo "🎨 Dark Mode + AdSense"
echo "--------------------"

if grep -q 'data-theme' apps/web/src/components/layout/MainLayout.astro; then
  check_pass "Dark theme implementation present"
else
  check_fail "Dark theme script missing"
fi

# ===================
# 5. SEO ESSENTIALS
# ===================
echo ""
echo "📈 SEO Essentials"
echo "----------------"

if [ -f "apps/web/dist/robots.txt" ]; then
  check_pass "robots.txt generated in build"
  if grep -q "Disallow: /$" apps/web/dist/robots.txt 2>/dev/null; then
    check_warn "robots.txt blocks root (Disallow: /)"
  fi
else
  check_fail "robots.txt missing from dist/"
fi

if [ -f "apps/web/dist/sitemap-index.xml" ]; then
  sitemap_count=$(grep -c "<sitemap>" apps/web/dist/sitemap-index.xml 2>/dev/null || echo 0)
  if [ "$sitemap_count" -gt 0 ]; then
    check_pass "Sitemap generated with $sitemap_count indexes"
  else
    check_fail "Sitemap exists but is empty"
  fi
else
  check_fail "sitemap-index.xml missing from dist/"
fi

if [ -f "apps/web/dist/.well-known/agent-index.json" ]; then
  check_pass "Agent discovery (agent-index.json) present"
else
  check_fail "Agent discovery missing"
fi

# ===================
# 6. METATAGS + OG
# ===================
echo ""
echo "🌐 Metadata & Open Graph"
echo "----------------------"

if grep -q 'og:type.*content={ogType}' apps/web/src/components/layout/MainLayout.astro; then
  check_pass "OG type dynamically configured"
else
  check_fail "OG type not properly configured"
fi

if grep -q 'og:image' apps/web/src/components/layout/MainLayout.astro; then
  check_pass "OG image configured"
else
  check_fail "OG image missing"
fi

if grep -q 'twitter:' apps/web/src/components/layout/MainLayout.astro; then
  check_pass "Twitter Card tags present"
else
  check_fail "Twitter Card tags missing"
fi

# ===================
# 7. STRUCTURED DATA
# ===================
echo ""
echo "📊 Structured Data (Schema.org)"
echo "-------------------------------"

if grep -q 'application/ld+json' apps/web/src/components/layout/MainLayout.astro; then
  check_pass "Structured data (JSON-LD) configured"
else
  check_fail "Structured data missing"
fi

if grep -q '"@context": "https://schema.org"' apps/web/src/components/layout/MainLayout.astro; then
  check_pass "Schema.org context present"
else
  check_fail "Schema.org context missing"
fi

# ===================
# SUMMARY
# ===================
echo ""
echo "======================================"
if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo "AdSense + SEO configuration is valid"
else
  echo -e "${RED}✗ $failed check(s) failed${NC}"
  echo "Review the failures above and fix"
fi
echo "======================================"

exit $failed
