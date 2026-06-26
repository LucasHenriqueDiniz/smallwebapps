export interface GuideDefinition {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedLabel: string;
  publishedDate: string;
  modifiedDate: string;
  image: string;
}

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
    image: "/og/site.svg"
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
    image: "/og/site.svg"
  },
  {
    slug: "json-formatting-and-validation",
    title: "JSON Formatting & Validation in the Browser",
    description:
      "Learn how to format, validate, and debug JSON in your browser without uploading files. Understand common JSON errors, when to minify, and best practices for working with APIs.",
    category: "Developer Tools",
    publishedLabel: "JSON best practices",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.svg"
  },
  {
    slug: "csv-cleaning-before-import",
    title: "CSV Cleaning Checklist Before Importing",
    description:
      "Prepare your CSV data for import with a practical checklist. Learn how to identify common issues, clean messy spreadsheet exports, and avoid data loss during processing.",
    category: "Data Tools",
    publishedLabel: "Data preparation guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.svg"
  },
  {
    slug: "browser-based-pdf-tools-safe-and-fast",
    title: "Browser-Based PDF Tools: Safe & Fast",
    description:
      "Discover why processing PDFs locally in your browser is safer and faster than cloud-based tools. Learn compression strategies, file size expectations, and when to use local vs. cloud approaches.",
    category: "PDF Tools",
    publishedLabel: "PDF security guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.svg"
  },
  {
    slug: "resize-compress-images-locally",
    title: "How to Resize & Compress Images Without Uploading",
    description:
      "Optimize images locally in your browser without uploading to third-party services. Learn format selection (JPG, PNG, WebP), quality trade-offs, and how to preserve or remove metadata safely.",
    category: "Image / Inspection",
    publishedLabel: "Image optimization guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.svg"
  },
  {
    slug: "privacy-first-file-tools-local-processing",
    title: "Privacy-First File Tools: How Local Processing Works",
    description:
      "Understand how browser-based file processing protects your privacy. Learn the technical difference between local and cloud tools, what stays on your device, and why client-side processing is safer for sensitive files.",
    category: "Data Tools",
    publishedLabel: "Privacy & security guide",
    publishedDate: "2026-06-26",
    modifiedDate: "2026-06-26",
    image: "/og/site.svg"
  }
];
