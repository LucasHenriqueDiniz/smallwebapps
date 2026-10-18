import type { AppDefinition } from "@smallwebapps/data";
import { isIndexable } from "@/data/indexing";

const LIMIT = 6;

/**
 * The tools a tool page links under "More tools in …".
 *
 * Only listed tools are candidates — the indexable set, per the 2026-10-18
 * decision in `docs/architecture/ARCHITECTURE.md`. The filter lives here rather
 * than in the caller so that passing the whole catalog cannot leak an unlisted
 * tool back into a related block.
 *
 * Among candidates, the same category is worth 10 and each shared tag 3, so
 * relevance decides the set; a live tool wins a tie by one. The indexable
 * boost and the curated pairs this replaced only ever ranked unlisted tools.
 */
export function relatedTools(app: AppDefinition, catalog: readonly AppDefinition[]): AppDefinition[] {
  const appTags = new Set(app.tags.map((tag) => tag.toLowerCase()));
  return catalog
    .filter((item) => item.slug !== app.slug && item.implemented && isIndexable(item.slug))
    .map((item) => {
      const sharedTags = item.tags.filter((tag) => appTags.has(tag.toLowerCase())).length;
      const sameCategory = item.category === app.category ? 1 : 0;
      const live = item.status === "live" ? 1 : 0;
      return { item, score: sameCategory * 10 + sharedTags * 3 + live };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, LIMIT)
    .map(({ item }) => item);
}
