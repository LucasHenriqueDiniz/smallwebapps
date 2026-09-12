export interface GuideDefinition {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedLabel: string;
  publishedDate: string;
  modifiedDate: string;
  image: string;
  relatedToolSlug: string;
  relatedToolLabel: string;
}

const RELATED_GUIDE_LIMIT = 3;

export const guides: GuideDefinition[] = [
  {
    slug: "how-to-export-youtube-watch-history",
    title: "How to Export Your YouTube Watch History",
    description:
      "Export YouTube watch history from Google Takeout, verify that the archive contains the right files, and prepare it for private browser-based analysis.",
    category: "YouTube Analysis",
    publishedLabel: "Google Takeout guide",
    publishedDate: "2026-06-02",
    modifiedDate: "2026-06-25",
    image: "/og/site.png",
    relatedToolSlug: "tubetrace",
    relatedToolLabel: "Open YouTube Watch History Analyzer"
  },
  {
    slug: "how-to-analyze-youtube-watch-history",
    title: "Analyze YouTube Watch History Locally",
    description:
      "Analyze a YouTube watch-history export locally, understand useful viewing patterns, and avoid unnecessary uploads of personal Google Takeout data.",
    category: "YouTube Analysis",
    publishedLabel: "Privacy-first analysis guide",
    publishedDate: "2026-06-02",
    modifiedDate: "2026-06-25",
    image: "/og/site.png",
    relatedToolSlug: "tubetrace",
    relatedToolLabel: "Open YouTube Watch History Analyzer"
  },
  {
    slug: "json-formatting-and-validation",
    title: "JSON Formatting & Validation in the Browser",
    description:
      "Format, validate and debug JSON in your browser without uploading files. Common JSON errors, when to minify, and practices for working with APIs.",
    category: "Developer Tools",
    publishedLabel: "JSON best practices",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.png",
    relatedToolSlug: "json-formatter",
    relatedToolLabel: "Open JSON Formatter"
  },
  {
    slug: "csv-cleaning-before-import",
    title: "CSV Cleaning Checklist Before Importing",
    description:
      "A practical checklist for preparing CSV data before an import: how to spot common issues, clean messy spreadsheet exports, and avoid losing rows.",
    category: "Data Tools",
    publishedLabel: "Data preparation guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.png",
    relatedToolSlug: "csv-cleaner",
    relatedToolLabel: "Open CSV Cleaner"
  },
  {
    slug: "browser-based-pdf-tools-safe-and-fast",
    title: "Browser-Based PDF Tools: Safe & Fast",
    description:
      "Why processing PDFs locally is safer and faster than cloud tools: compression strategies, realistic file-size expectations, and when cloud still wins.",
    category: "PDF Tools",
    publishedLabel: "PDF security guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.png",
    relatedToolSlug: "pdf-compress",
    relatedToolLabel: "Open PDF Compressor"
  },
  {
    slug: "resize-compress-images-locally",
    title: "How to Resize & Compress Images Without Uploading",
    description:
      "Optimize images locally, with no upload to a third party: choosing between JPG, PNG and WebP, quality trade-offs, and handling metadata safely.",
    category: "Image / Inspection",
    publishedLabel: "Image optimization guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.png",
    relatedToolSlug: "image-resize",
    relatedToolLabel: "Open Image Resizer"
  },
  {
    slug: "privacy-first-file-tools-local-processing",
    title: "Privacy-First File Tools: How Local Processing Works",
    description:
      "How browser-based file processing protects privacy: the real difference between local and cloud tools, and what actually stays on your device.",
    category: "Data Tools",
    publishedLabel: "Privacy & security guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.png",
    relatedToolSlug: "",
    relatedToolLabel: "Browse all tools"
  },
  {
    slug: "youtube-watch-history-json-format",
    title: "watch-history.json: A Field-by-Field Reference",
    description:
      "Every field Google Takeout writes into watch-history.json, what each one means, which are missing on removed videos, and what the export does not record at all.",
    category: "YouTube Analysis",
    publishedLabel: "Format reference",
    publishedDate: "2026-08-27",
    modifiedDate: "2026-08-27",
    image: "/og/site.png",
    relatedToolSlug: "tubetrace",
    relatedToolLabel: "Open the watch history analyzer"
  },
  {
    slug: "why-youtube-watch-counts-differ",
    title: "Why Your YouTube Watch Count Differs Between Tools",
    description:
      "Two analyzers reading the same Takeout export routinely disagree on how many videos you watched. The difference comes from filtering rules, not from bugs.",
    category: "YouTube Analysis",
    publishedLabel: "Data accuracy",
    publishedDate: "2026-08-27",
    modifiedDate: "2026-08-27",
    image: "/og/site.png",
    relatedToolSlug: "tubetrace",
    relatedToolLabel: "Open the watch history analyzer"
  },
  {
    slug: "youtube-takeout-json-vs-html",
    title: "Takeout JSON or HTML: Which Watch History Export to Choose",
    description:
      "Takeout offers watch history as JSON or HTML. They are not equivalent. One has unambiguous timestamps; the other has dates written in your account's language.",
    category: "YouTube Analysis",
    publishedLabel: "Export formats",
    publishedDate: "2026-08-27",
    modifiedDate: "2026-08-27",
    image: "/og/site.png",
    relatedToolSlug: "tubetrace",
    relatedToolLabel: "Open the watch history analyzer"
  },
  {
    slug: "what-your-youtube-history-reveals",
    title: "What Your YouTube Watch History Reveals About You",
    description:
      "A timestamped log of what you watched is more revealing than most people expect. What can be inferred from the export, and why that argues for local analysis.",
    category: "YouTube Analysis",
    publishedLabel: "Privacy analysis",
    publishedDate: "2026-08-27",
    modifiedDate: "2026-08-27",
    image: "/og/site.png",
    relatedToolSlug: "tubetrace",
    relatedToolLabel: "Open the watch history analyzer"
  },
  {
    slug: "pause-delete-youtube-history",
    title: "Pausing & Deleting YouTube History: What Takeout Keeps",
    description:
      "How pausing, deleting, and auto-delete change what a future Takeout export contains, and how each one shows up as a gap in your own data.",
    category: "YouTube Analysis",
    publishedLabel: "History controls",
    publishedDate: "2026-08-27",
    modifiedDate: "2026-08-27",
    image: "/og/site.png",
    relatedToolSlug: "tubetrace",
    relatedToolLabel: "Open the watch history analyzer"
  }
];

const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

/**
 * Slugs whose category holds one or two guides, so the category alone cannot
 * name three siblings. The pairing is topical instead: a format guide next to
 * the data guides, a local-processing guide next to the file tools.
 */
const curatedRelatedSlugs: Record<string, string[]> = {
  "json-formatting-and-validation": [
    "csv-cleaning-before-import",
    "youtube-watch-history-json-format",
    "privacy-first-file-tools-local-processing"
  ],
  "csv-cleaning-before-import": [
    "json-formatting-and-validation",
    "privacy-first-file-tools-local-processing",
    "browser-based-pdf-tools-safe-and-fast"
  ],
  "browser-based-pdf-tools-safe-and-fast": [
    "privacy-first-file-tools-local-processing",
    "resize-compress-images-locally",
    "csv-cleaning-before-import"
  ],
  "resize-compress-images-locally": [
    "browser-based-pdf-tools-safe-and-fast",
    "privacy-first-file-tools-local-processing",
    "json-formatting-and-validation"
  ],
  "privacy-first-file-tools-local-processing": [
    "what-your-youtube-history-reveals",
    "browser-based-pdf-tools-safe-and-fast",
    "resize-compress-images-locally"
  ]
};

const resolveSlugs = (slugs: string[]): GuideDefinition[] =>
  slugs.flatMap((slug) => {
    const guide = guideBySlug.get(slug);
    return guide ? [guide] : [];
  });

/**
 * Siblings taken from the category as a ring rather than as a top-N list: the
 * guide at position i points at i+1, i+2 and i+3, wrapping. Every member of a
 * category therefore receives exactly as many inlinks as it gives, which is
 * what keeps the seven YouTube guides one cluster instead of two hubs and five
 * pages nothing points at.
 */
function categoryRing(guide: GuideDefinition): GuideDefinition[] {
  const family = guides.filter((item) => item.category === guide.category);
  const start = family.findIndex((item) => item.slug === guide.slug);
  const take = Math.min(RELATED_GUIDE_LIMIT, family.length - 1);
  return Array.from({ length: take }, (_, offset) => family[(start + 1 + offset) % family.length]);
}

export function relatedGuides(slug: string): GuideDefinition[] {
  const curated = curatedRelatedSlugs[slug];
  if (curated) return resolveSlugs(curated).slice(0, RELATED_GUIDE_LIMIT);

  const guide = guideBySlug.get(slug);
  return guide ? categoryRing(guide) : [];
}

/** The reverse of `relatedToolSlug`: the guides that point at one tool. */
export function guidesForTool(toolSlug: string): GuideDefinition[] {
  if (!toolSlug) return [];
  return guides.filter((guide) => guide.relatedToolSlug === toolSlug);
}
