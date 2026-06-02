import type { AppDefinition } from "@smallwebapps/data";

export const apps: AppDefinition[] = [
  {
    slug: "tubetrace",
    name: "TubeTrace",
    category: "YouTube / Data",
    status: "live",
    mode: "embedded",
    implemented: true,
    shortDescription: "Analyze your YouTube watch history from Google Takeout.",
    longDescription:
      "TubeTrace is a privacy-first YouTube watch history analyzer that turns your local export into readable viewing insights. It helps users inspect file structure, estimate watch-history volume, and surface patterns without uploading data to a server.",
    appUrl: "/apps/tubetrace",
    landingUrl: "/apps/tubetrace",
    tags: ["Google Takeout", "YouTube history", "Privacy-first", "Local analysis"],
    features: [
      "Upload a local export or paste raw history data",
      "Estimate watch-entry volume and event density",
      "Surface timestamps, watch links, and likely channel mentions",
      "Run entirely in the browser with no account required"
    ],
    faq: [
      {
        question: "Does TubeTrace upload my history file?",
        answer:
          "No. The v1 implementation is designed to inspect the file in the browser only and keep analysis local to the current tab."
      },
      {
        question: "Is TubeTrace a full YouTube analytics replacement?",
        answer:
          "No. It is a lightweight local inspection tool and landing point for future TubeTrace iterations inside Small Web Apps."
      }
    ],
    seo: {
      title: "TubeTrace - YouTube Watch History Analyzer",
      description:
        "Analyze your YouTube watch history locally from a Google Takeout export. Inspect timestamps, likely watch entries, and viewing patterns in your browser."
    }
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    category: "Developer Tools",
    status: "live",
    mode: "embedded",
    implemented: true,
    shortDescription: "Format, validate, and inspect JSON directly in your browser.",
    longDescription:
      "JSON Formatter is a fast browser-based utility for developers, students, and analysts who need to validate, pretty-print, minify, or quickly inspect structured data without sending it anywhere.",
    appUrl: "/apps/json-formatter",
    landingUrl: "/apps/json-formatter",
    tags: ["JSON", "Developer tools", "Local utility", "Validation"],
    features: [
      "Pretty-print or minify JSON",
      "Validate input and show parse errors",
      "Inspect top-level keys and array length",
      "Keep data in the browser"
    ],
    faq: [
      {
        question: "Can I use this for sensitive JSON?",
        answer:
          "Yes, if local browser processing is sufficient for your workflow. The app is designed to avoid server-side upload."
      },
      {
        question: "Does it support huge files?",
        answer:
          "The browser can handle moderate inputs well, but very large files may still be constrained by device memory."
      }
    ],
    seo: {
      title: "JSON Formatter & Viewer",
      description:
        "Format, validate, and inspect JSON locally in your browser with a lightweight JSON formatter and viewer."
    }
  },
  {
    slug: "ai-image-checker",
    name: "AI Image Checker",
    category: "Image / Inspection",
    status: "coming-soon",
    mode: "embedded",
    implemented: true,
    shortDescription: "Inspect images for common AI-generation signals and visual artifacts.",
    longDescription:
      "AI Image Checker helps users inspect images for metadata clues, dimensions, alpha usage, and suspicious patterns that deserve closer review. It is positioned as an inspection assistant, not a definitive detector.",
    appUrl: "/apps/ai-image-checker",
    landingUrl: "/apps/ai-image-checker",
    tags: ["Image inspection", "AI artifacts", "Metadata", "Heuristics"],
    features: [
      "Read basic file and image metadata in the browser",
      "Highlight heuristic signals that may warrant closer inspection",
      "Show a non-definitive review summary",
      "Keep the workflow local to the current browser session"
    ],
    faq: [
      {
        question: "Can this prove that an image is AI-generated?",
        answer:
          "No. It highlights signals and inconsistencies only. Human review and provenance are still necessary."
      },
      {
        question: "Why launch it as coming soon if the page already has a tool?",
        answer:
          "The embedded preview demonstrates the inspection direction, while the full workflow and deeper heuristics are still being expanded."
      }
    ],
    disclaimer:
      "This tool cannot prove whether an image is AI-generated. It only highlights signals that may deserve closer inspection.",
    seo: {
      title: "AI Image Checker - Inspect Suspicious Image Signals",
      description:
        "Inspect images for metadata clues, dimensions, alpha usage, and suspicious signals in your browser. This tool is an inspection assistant, not a definitive detector."
    }
  },
  {
    slug: "csv-cleaner",
    name: "CSV Cleaner",
    category: "Data Tools",
    status: "coming-soon",
    mode: "embedded",
    implemented: true,
    shortDescription: "Preview, clean, split, and normalize CSV files locally.",
    longDescription:
      "CSV Cleaner is a browser-based utility for cleaning messy spreadsheet exports. It helps remove blank rows, trim whitespace, estimate column structure, and create a cleaner output without uploading files.",
    appUrl: "/apps/csv-cleaner",
    landingUrl: "/apps/csv-cleaner",
    tags: ["CSV", "Cleaning", "Spreadsheet", "Local utility"],
    features: [
      "Preview row and column structure",
      "Trim whitespace and drop fully empty rows",
      "Generate a cleaned CSV output",
      "Stay local in the browser"
    ],
    faq: [
      {
        question: "Will CSV Cleaner preserve my original file?",
        answer:
          "Yes. The tool works on the data you load into the browser and shows a cleaned output separately."
      },
      {
        question: "Does it support every CSV edge case?",
        answer:
          "No. The initial version is intentionally lightweight and best suited to simple to moderately messy CSV files."
      }
    ],
    seo: {
      title: "CSV Cleaner - Clean and Preview CSV Files Locally",
      description:
        "Preview, trim, and normalize CSV files in your browser with a lightweight local CSV cleaner."
    }
  }
];

export const appMap = Object.fromEntries(apps.map((app) => [app.slug, app]));
