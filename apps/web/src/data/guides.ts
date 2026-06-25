export interface GuideDefinition {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedLabel: string;
}

export const guides: GuideDefinition[] = [
  {
    slug: "how-to-export-youtube-watch-history",
    title: "How to Export Your YouTube Watch History",
    description:
      "A practical guide to locating the right Google Takeout export so you can inspect your viewing history locally.",
    category: "YouTube Analysis",
    publishedLabel: "Starter guide"
  },
  {
    slug: "how-to-analyze-youtube-watch-history",
    title: "How to Analyze Your YouTube Watch History Without Uploading It",
    description:
      "A privacy-first workflow for inspecting watch-history exports, spotting patterns, and keeping the data in your browser.",
    category: "YouTube Analysis",
    publishedLabel: "Starter guide"
  }
];
