---
tags: [research, area/frontend, area/seo, 2026-10-18-adsense-low-value-review]
status: active
decided: 2026-10-18
---

# What does smallwebapps.com need settled before it asks AdSense for another review?

> Pages a reviewer can reach count, `noindex` or not. All 12 variant pages can be redirected without
> losing anything, and the PDF ones promise a target they never act on. Google has indexed 14 of the
> 47 sitemap URLs. No public page sets a waiting period, a penalty or a traffic bar for asking
> again, **but the account's own verdict panel requires "interesse genuíno do usuário"** — see
> "Correction 2026-10-18".

## What was blocking

The Research Needed list of [[adsense-low-value-review]]. Three of its lines are owner decisions —
the fate of the 114 commodity tools, the bar for requesting review, and the home page headline. This
note gives those decisions their facts but does not make them. The rest is answered below.

## Findings

### 1. Does the AdSense review look at `noindex` pages it can reach by link?

**No source says they are excluded, and the closest primary source says the review is not limited
to what Search indexes.**

- AdSense: "we may review all pages of your site, not just the sign-up URL where you placed the
  code." (`fetches/adsense-account-not-approved.md`)
- `noindex` is documented as a Google **Search** rule. The page says Google "will drop that page
  entirely from Google Search results" and names no other product. (`fetches/search-block-indexing-noindex.md`)
- Search's site reputation section presumes "individual pages (including new pages) match the
  overall quality of other pages on the domain." That is a Search policy, cited for the shape of
  Google's thinking, not as an AdSense rule. (`fetches/search-spam-policies-doorways.md`)

Reading: treat every page linked from the home page, `/apps/` or a tool page as in scope of the
review. `noindex` keeps a page out of Search. Nothing documented keeps it out of the review.

### 2. What can each variant redirect to, and is anything lost? (measured in code)

| variant | component it mounts | what differs from the base | redirect to |
|---|---|---|---|
| `compress-pdf-to-{100kb,200kb,500kb,1mb}` | `PdfCompressVariantApp` → `PdfCompressApp targetKB=…` | **only two strings.** In `PdfCompressApp.tsx`, `targetKB` appears at line 77 (a heading) and line 84 (a disclaimer). The compression itself is the same pdf-lib object-stream rebuild either way. | `/apps/pdf-compress/` |
| `compress-image-to-{50kb,100kb,200kb}`, `compress-{jpg,png,webp}-to-100kb` | `ImageCompressVariantApp` (24 lines) → `ImageOptimizeApp initialMaxSizeMB=targetKB/1024` | only the starting value of the max-size slider. The base already offers that slider, from 0.02 to 10 MB. | `/apps/image-optimize/` |
| `jpg-to-text`, `png-to-text` | `ImageToTextApp accept="image/jpeg"` / `"image/png"` | only the file-picker filter | `/apps/image-to-text/` |

So none of the 12 redirects loses a feature, and the pitch's "fold target-size presets into the base
tools" step is unnecessary. The four PDF variants are worse than redundant: their heading says
"Compress PDF toward 100KB" and nothing in the code aims at 100 KB. That is exactly what Google's
doorway definition describes — "intermediate pages that aren't as useful as the final destination".
(`fetches/search-spam-policies-doorways.md`)

### 3. How do the redirects have to be written? (measured in production)

`apps/web/public/_redirects` already holds `/tubetrace-app/ /apps/tubetrace/ 301`. Production on
2026-10-18:

| request | result |
|---|---|
| `/tubetrace-app/` | 301 → `/apps/tubetrace/` |
| `/tubetrace-app` (no slash) | **404** |
| `/sitemap.xml` | 301 → `/sitemap-index.xml` |

The source path must match exactly. Each variant therefore needs two lines, with and without the
trailing slash: 24 lines in all, well under Cloudflare's 2,000-rule limit. The status code has to be
written out, because it "defaults to 302". Redirects "are always followed, regardless of whether or
not an asset matches", so the redirect works even before the pages are deleted.
(`fetches/cloudflare-pages-redirects.md`)

### 4. What has Google actually indexed? (measured, URL Inspection API, 2026-10-18)

All 47 sitemap URLs were inspected with the Search Console URL Inspection API. The raw results are
in `url-inspection-2026-10-18.json`.

| coverage | count | URLs |
|---|---|---|
| Submitted and indexed | **14** | `/`, `/apps/`, `/guides/`, `/terms/`, 5 tools (`tubetrace`, `pdf-compress`, `image-resize`, `image-to-pdf`, `youtube-tag-extractor`), 5 guides |
| Crawled – currently not indexed | 7 | 5 tools (`image-format-converter`, `image-metadata`, `pdf-watermark`, `youtube-chapter-generator`, `youtube-url-parser`), 2 guides (`how-to-analyze-youtube-watch-history`, `resize-compress-images-locally`) |
| Discovered – currently not indexed | 22 | including `/about/`, `/contact/`, `/privacy/` |
| URL is unknown to Google | 4 | `ai-image-checker`, `exif-viewer`, `pdf-extract-text`, `pdf-split` |

- 26 of the 47 URLs have never been crawled.
- Guides: 5 of 12 indexed, up from 1 on 2026-09-12 (`330a61d`).
- Tool pages: 5 of 28 indexed.
- Google's chosen canonical matches the declared one on every URL that has one.
- Search Console's sitemap report shows `sitemap-0.xml` last downloaded on 2026-10-10, with 47
  submitted.
- "Crawled – currently not indexed" is Google Search looking at a page and declining it. That
  happened to 7 of the 21 URLs it crawled.

### 5. Is there a waiting period, a penalty, or a traffic bar for asking again?

- **No waiting period or penalty is documented** on the pages read
  (`fetches/adsense-site-status.md`, `fetches/adsense-account-not-approved.md`,
  `fetches/adsense-add-new-site.md`). The only official re-review timeline found is about
  *inactive* sites, at five months (`fetches/adsense-site-inactive.md`). It does not apply here.
- A review "usually takes a few days, but in some cases can take 2-4 weeks."
- Removing the site and adding it again "can delay the process". Keep the existing entry and use
  Request review. (`fetches/adsense-site-status.md`)
- The eligibility page says content must "attract an audience" (`fetches/adsense-eligibility.md`)
  but gives no number: no traffic, click, page or indexing threshold anywhere.

### 6. Does the consent banner affect approval, and what replaces it?

- The certified-CMP rule decides **which ads serve** in the EEA, UK and Switzerland: "Only traffic
  from a certified CMP is eligible for personalized ads." Traffic without one "may be eligible for
  non-personalized ads or limited ads." No source ties it to site approval.
  (`fetches/adsense-cmp-requirements.md`)
- AdSense's own European regulations messages are "certified in accordance with the new TCF
  requirement", and they can feed consent mode. (`fetches/adsense-cmp-requirements.md`,
  `fetches/adsense-consent-mode-settings.md`)

## Verdict

1. **Retire and redirect all 12 variants** to `/apps/pdf-compress/`, `/apps/image-optimize/` and
   `/apps/image-to-text/`, two `_redirects` lines each, with `301` written out. Nothing is lost, and
   the PDF four advertise a behaviour the code does not have.
2. **Plan as if every page reachable by link gets reviewed.** For the owner's decision on the 114
   commodity tools, this means `noindex` alone does not take them out of what a reviewer sees. Only
   unlinking or deleting does. On deletion, Google Search says "deleting the unhelpful content can
   help the good content on your site perform better", and also that deleting "is a last resort".
   (`fetches/search-core-updates.md`)
3. **Do not gate the review request on indexing coverage.** No source links Search indexing to
   AdSense approval, and no source makes an early request costly beyond the review time itself.
   The evidence supports requesting review **once the content fixes are live in production**, not
   after an indexing threshold. This replaces the "owner's bar" step the pitch proposed. The bar is
   still the owner's to set, but no evidence asks for one.
4. **Leave the CMP until after approval.** It decides which ads serve, not whether the site is
   approved.

## Correction 2026-10-18: verdict 3 is wrong

**Verdict 3 is superseded.** It said no source ties approval to audience, so the review should be
requested as soon as the fixes were live. The one source this note had not read says otherwise:
AdSense's own verdict panel for this site, behind the account login
(`fetches/adsense-site-detail-panel.md`). It requires sites to "mostrar um nível de interesse do
usuário que apoie uma parceria de publicidade comercial", and the resubmission checklist asks
whether the site "gera e mantém o interesse genuíno do usuário". Over 2026-07-19 to 2026-10-16 the
site had **0 clicks**. The content fixes do not change that.

The strongest case against verdict 3, written below before this was found, turned out to be the
right one. Every public help page was read, and the deciding text was on none of them. It was on
the page the rejection itself links to. **Read the account's own verdict before the public docs.**

The owner ruled on 2026-10-18 to wait for user interest before requesting the review. No number
is given anywhere, so when to ask is a judgement made from Search Console clicks.

## The strongest case against this verdict

- **Against point 3:** Search crawled 21 of these URLs and declined 7, including 2 of the guides.
  That is Google's own quality system calling a third of what it read not worth indexing. If AdSense
  shares signals with Search — and nothing published says it does or does not — an early request
  meets the same judgement and comes back "Needs attention" again. The cost is one review cycle
  (days to 2-4 weeks) and no documented penalty, which is why the verdict accepts that risk rather
  than waiting months for coverage that may not come.
- **Against point 2:** The "all pages" sentence says "may", and a reviewer could just as well sample
  only the URLs Search indexed. If so, unlisting the commodity tools buys nothing. Looked for a
  primary source either way and found none.

## What this does not establish

- **Whether AdSense reviewers or the Mediapartners crawler honour `noindex`.** No primary source
  found in either direction.
- **Whether AdSense uses Search quality signals** such as "Crawled – currently not indexed". No
  primary source found.
- Why the URL Inspection API reports 4 tool pages as "unknown to Google", with no sitemap reference,
  when the sitemap holding them was downloaded on 2026-10-10. Possibly a lag between the two reports.
  Not investigated.
- Whether AdSense's European regulations message can coexist with the site's own banner for
  non-EEA traffic. The pages read do not say.
- The community guide "How can you solve the 'low value content' AdSense disapproval challenge?"
  (support.google.com/adsense/community-guide/241032356) was fetched, but only navigation came back.
  **It was not read**, so nothing here rests on it.
- Third-party guides that surfaced in search (eiway.com, sahildubey.com, freeacademy.ai) were seen
  only as search snippets, never read, and are not cited.

## Sources

- AdSense → Sites → smallwebapps.com, the verdict panel (owner's account, behind login) — `fetches/adsense-site-detail-panel.md` — the "interesse do usuário" requirement that supersedes verdict 3
- [Your AdSense account wasn't approved](https://support.google.com/adsense/answer/81904?hl=en) — `fetches/adsense-account-not-approved.md` — review covers "all pages"; low value content wording
- [Check the status of your AdSense sites](https://support.google.com/adsense/answer/12170222?hl=en) — `fetches/adsense-site-status.md` — status meanings; 2-4 weeks; do not remove and re-add
- [Add a new site to your AdSense sites list](https://support.google.com/adsense/answer/12169212?hl=en) — `fetches/adsense-add-new-site.md` — what the site check verifies
- [Your site is inactive](https://support.google.com/adsense/answer/9393996?hl=en) — `fetches/adsense-site-inactive.md` — the only official re-review timeline, and not this case
- [AdSense eligibility requirements](https://support.google.com/adsense/answer/9724?hl=en) — `fetches/adsense-eligibility.md` — "attract an audience", no number
- [Make sure your site's pages are ready for AdSense](https://support.google.com/adsense/answer/7299563?hl=en) — `fetches/adsense-pages-ready.md` — originality and navigation guidance
- [Google consent management requirements (EEA, UK, Switzerland)](https://support.google.com/adsense/answer/13554116?hl=en) — `fetches/adsense-cmp-requirements.md` — CMP decides which ads serve; AdSense's message is certified
- [Manage consent mode settings](https://support.google.com/adsense/answer/16053245?hl=en) — `fetches/adsense-consent-mode-settings.md` — Google's CMP feeds consent mode
- [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies) — `fetches/search-spam-policies-doorways.md` — doorway definition; site reputation presumption
- [Google Search's core updates and your website](https://developers.google.com/search/docs/appearance/core-updates) — `fetches/search-core-updates.md` — deletion as last resort, and its upside
- [Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) — `fetches/search-block-indexing-noindex.md` — `noindex` is scoped to Search
- [Cloudflare Pages — Redirects](https://developers.cloudflare.com/pages/configuration/redirects/) — `fetches/cloudflare-pages-redirects.md` — `_redirects` format, default 302, limits, precedence
- Search Console URL Inspection API and Sitemaps API, queried 2026-10-18 — `url-inspection-2026-10-18.json` — the indexing table in finding 4 (measured)
- Repository code at `8f6b5d9` — `PdfCompressApp.tsx`, `ImageCompressVariantApp.tsx`, `ToolMount.astro` — finding 2 (measured)
