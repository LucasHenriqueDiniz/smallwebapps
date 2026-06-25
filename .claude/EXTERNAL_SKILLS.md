# External Skills for Small Web Apps

Two professional Claude Code skills are recommended for SEO and AdSense auditing.

## 1. Claude SEO (Full Site Audit)

**Repository**: https://github.com/AgricIDaniel/claude-seo

Professional SEO skill that runs **25 sub-skills + 18 specialist agents in parallel**:
- Technical SEO (Core Web Vitals, crawlability, indexability)
- Content quality (E-E-A-T, word count, readability)
- Schema.org markup validation
- AI search optimization (GEO)
- Local SEO, e-commerce SEO, international SEO
- Backlinks, competitive analysis

**Installation**:
```bash
git clone https://github.com/AgricIDaniel/claude-seo.git ~/.claude/skills/claude-seo
```

**Usage in Claude Code**:
```
/seo audit

URL: https://smallwebapps.com
Site type: Tool site
```

**Output**: Prioritized action plan with 0-100 score, falsifiable recommendations, primary-source evidence from Google.

**When to use**: 
- Quarterly full site audits
- Before major launches
- Competitive analysis
- Content strategy planning

---

## 2. AdSense Site Auditor (Eligibility Check)

**Repository**: https://github.com/LucasHenriqueDiniz/adsense-site-auditor

Dedicated AdSense eligibility auditor that checks **73 official requirement IDs**:
- Google AdSense Help & Program Policies
- Publisher Policies & Restrictions
- Thin content detection (automated word count)
- Duplicate page detection
- Site-specific rubrics: **Tool/Utility sites**, Quiz/Entertainment

**Installation**:
```bash
git clone https://github.com/LucasHenriqueDiniz/adsense-site-auditor.git ~/.claude/skills/adsense-site-auditor
```

**Usage in Claude Code**:
```
/adsense-site-auditor

URL: https://smallwebapps.com
Site type: Tool site
```

**Output**: 
- `Not ready` / `Ready after fixes` / `Ready` verdict
- Checklist with `Pass` / `Fail` / `Unknown` / `N/A` for all 73 requirements
- Severity breakdown: `Blocker`, `High`, `Medium`
- Evidence-backed findings (not vague)

**Helper Scripts** (Optional but recommended):
```bash
# Install dependencies
pip install requests

# Run crawl + analysis
python scripts/crawl.py https://smallwebapps.com
python scripts/thin-content-detector.py https://smallwebapps.com
python scripts/duplicate-detector.py https://smallwebapps.com

# Paste output into /adsense-site-auditor prompt for richer evidence
```

**When to use**:
- Before applying for AdSense
- After rejection (diagnosis mode)
- Pre-launch verification
- Post-fix validation
- Health checks (quarterly)

---

## Setup in This Project

### Step 1: Install Both Skills

```bash
# Install Claude SEO
git clone https://github.com/AgricIDaniel/claude-seo.git ~/.claude/skills/claude-seo

# Install AdSense Site Auditor
git clone https://github.com/LucasHenriqueDiniz/adsense-site-auditor.git ~/.claude/skills/adsense-site-auditor

# Optional: Install AdSense helper scripts
cd ~/.claude/skills/adsense-site-auditor
pip install requests
```

### Step 2: Use in Claude Code

After installation, both skills appear in the command palette:
- `/seo audit` → Full site SEO analysis
- `/adsense-site-auditor` → AdSense eligibility check

### Step 3: Suggested Workflow

Before each release to production:

```bash
# 1. Run our quick validators
./.claude/skills/build-validator.sh
./.claude/skills/seo-adsense-validator.sh

# 2. For deep audit (optional but recommended)
/seo audit
# → Returns: 0-100 score, action plan, evidence

# 3. For AdSense compliance verification
/adsense-site-auditor
# → Returns: Pass/Fail on 73 requirements, verdict

# 4. If fixes needed, implement + re-run

# 5. Commit & push
git push origin main
# → Cloudflare auto-deploys
```

---

## Differences Between Skills

| Aspect | `seo-adsense-validator.sh` | `/seo audit` | `/adsense-site-auditor` |
|--------|---------------------------|-------------|----------------------|
| **Scope** | Quick local checks (2 sec) | Full site audit (5 min) | AdSense compliance (3 min) |
| **Output** | Checklist (✓/⚠/✗) | 0-100 score + action plan | Pass/Fail on 73 requirements |
| **Speed** | Fast (before commit) | Slower (deep analysis) | Medium (interactive) |
| **When** | Always | Quarterly/pre-launch | Pre-apply, post-reject |
| **Agents** | None | 18 parallel agents | Single agent |

---

## Small Web Apps Configuration

For **Small Web Apps** specifically:
- Site type: **Tool site** (utilities, not blog)
- Focus: Technical SEO + Content quality (E-E-A-T)
- AdSense: Word count ≥200 per tool page, original content
- Schema: SoftwareApplication (tools), Article (guides)

Recommended audit schedule:
- **Weekly**: Run `./.claude/skills/build-validator.sh` (quick)
- **Weekly**: Run `./.claude/skills/seo-adsense-validator.sh` (quick)
- **Monthly**: Run `/seo audit` (deep)
- **Quarterly**: Run `/adsense-site-auditor` (compliance check)

---

## Resources

- **Claude SEO Docs**: https://github.com/AgricIDaniel/claude-seo#table-of-contents
- **AdSense Auditor Docs**: https://github.com/LucasHenriqueDiniz/adsense-site-auditor#usage
- **Google AdSense Policies**: https://support.google.com/adsense/answer/48182
- **Google Search Essentials**: https://developers.google.com/search
