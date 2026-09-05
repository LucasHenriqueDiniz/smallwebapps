import { isIndexableUrl } from "@/data/indexing";

/**
 * Where the AdSense loader is allowed to run.
 *
 * It used to run everywhere, which meant three places it must not:
 *
 * 1. `pnpm dev` and every Cloudflare Pages preview deployment. Real ad requests
 *    from a development machine or a branch preview are invalid traffic, and
 *    invalid traffic is how accounts get suspended.
 * 2. dist/404.html. AdSense policy forbids ads on error pages.
 * 3. The 112 pages served with `noindex, follow`. Harmless today because the
 *    site has no ad unit, but the day Auto Ads is switched on in the console it
 *    turns into ads on pages Google was asked not to index — which is the exact
 *    "low value content" surface the site was already rejected over. So they do
 *    not get the loader.
 *
 * Indexability comes from indexing.ts, the same source the sitemap filter uses.
 * There is no second list.
 */

/**
 * Cloudflare Pages sets CF_PAGES=1 and CF_PAGES_BRANCH on every build it runs,
 * preview or not. Both are read, and which one is missing matters:
 *
 * - On Cloudflare (CF_PAGES set) the branch decides, and an absent or
 *   unrecognised branch is treated as a preview. Failing closed there costs
 *   nothing but revenue on one deploy; failing open serves real ads from a
 *   preview URL, which is invalid traffic and how accounts get suspended.
 * - Off Cloudflare (CF_PAGES unset) the only way this runs under PROD is the
 *   owner's own `pnpm deploy:cloudflare`, which is a deliberate production
 *   publish from a local machine. That one is allowed.
 */
const PRODUCTION_BRANCH = "main";

const ERROR_PAGES = new Set(["/404", "/404/"]);

function isProductionDeploy(): boolean {
  // Not a presence check on the client ID — the hardcoded fallback in
  // AdSenseHead.astro exists precisely so an unset variable cannot silently
  // drop the loader in production. This gate is about the environment.
  if (!import.meta.env.PROD) return false;
  if (import.meta.env.PUBLIC_ADSENSE_DISABLED === "true") return false;

  const onCloudflare = Boolean(process.env.CF_PAGES);
  if (!onCloudflare) return true;
  return process.env.CF_PAGES_BRANCH === PRODUCTION_BRANCH;
}

export function shouldLoadAds(pathname: string): boolean {
  if (!isProductionDeploy()) return false;
  if (ERROR_PAGES.has(pathname)) return false;
  return isIndexableUrl(pathname);
}
