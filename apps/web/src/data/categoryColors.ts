/**
 * Maps each tool category to a brand color used for og:image generation
 * and other category-tinted UI accents.
 */
export const categoryColors: Record<string, string> = {
  "PDF Tools": "#e11d48",
  "Developer Tools": "#1a73e8",
  "Image / Inspection": "#16a34a",
  "Data Tools": "#f59e0b",
  "YouTube / Data": "#7c3aed",
};

export const defaultCategoryColor = "#1a73e8";

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? defaultCategoryColor;
}
