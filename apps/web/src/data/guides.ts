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
  }
];
