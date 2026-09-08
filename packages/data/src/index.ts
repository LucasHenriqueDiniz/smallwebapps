export type AppMode = "embedded" | "external";
export type AppStatus = "live";

export interface AppFaq {
  question: string;
  answer: string;
}

export interface AppSeo {
  title: string;
  description: string;
}

/**
 * A prose section for tools that have genuinely original reference material —
 * a documented file format, an official platform limit, a parsing rule. Bullets
 * cannot carry that, so this renders as headed paragraphs below the tool.
 *
 * Optional and deliberately sparse: only add one where there is something
 * specific and verifiable to say. Padding every tool with generic prose is the
 * "low value content" pattern this field exists to avoid.
 */
export interface AppDeepDive {
  heading: string;
  /** Paragraphs. Each string renders as its own <p>. */
  body: string[];
  /** Optional term/definition pairs, e.g. fields of a file format. */
  definitions?: { term: string; definition: string }[];
  /** Optional source link backing the claims in this section. */
  source?: { label: string; url: string };
}

export interface AppContent {
  /** Step-by-step "how to use" instructions. */
  howToUse?: string[];
  /** Real-world use cases / scenarios for this tool. */
  useCases?: string[];
  /** Known technical limitations or caveats. */
  limitations?: string[];
  /** Privacy/processing note (e.g. "Your file never leaves your device"). */
  privacy?: string;
  /** Original reference material. Omit unless there is something concrete to document. */
  deepDive?: AppDeepDive[];
}

/**
 * How a tool arranges its own working area inside the tool card.
 *
 * These are not a taste call: they are what the existing tool components
 * already do, read off their RENDER ROOTS. That last part matters — an earlier
 * pass counted "files containing a two-column grid" and got the split family
 * badly wrong, because plenty of tools split somewhere inside a section while
 * their stage is a plain vertical run.
 *
 *  stack        vertical run of sections, one column
 *  split        two comparable panes, input beside result
 *  split-rail   one main workspace beside a narrow fixed control/summary rail
 *  intake       file in, result out, one column
 *  intake-split file in beside its options, result below
 *
 * `split-rail` earned its place the same way: the roots that split were two
 * distinct shapes, half of them a proportional pair and half a workspace with
 * a 260–440px rail, and collapsing those into one ratio would have restyled
 * ten tools to make a taxonomy look tidier than the code is.
 *
 * `custom` is the escape hatch and should stay embarrassing to reach for: a
 * tool earns it by demonstrably not fitting, with the reason written down.
 */
export type AppLayout =
  | "stack"
  | "split"
  | "split-rail"
  | "intake"
  | "intake-split"
  | "custom";

/**
 * Optional reading-width cap for a layout, in Tailwind's scale. The union
 * lists the caps actually in use, not the whole scale — an unused value here is
 * a rule in the shell that nothing exercises.
 */
export type AppLayoutWidth = "md" | "lg" | "xl" | "5xl";

/**
 * Rail width for `split-rail`, in px. Declared rather than canonical because
 * the rail holds different things per tool — a 260px swatch column and a 440px
 * SEO report are both correct, and forcing one number would break one of them.
 * Keeping it here rather than in JSX is the point: it is visible and auditable
 * next to the rest of the tool's metadata.
 */
export type AppLayoutRail = 260 | 280 | 320 | 420 | 440;

export interface AppDefinition {
  slug: string;
  name: string;
  category: string;
  status: AppStatus;
  mode: AppMode;
  /**
   * Stage layout. Omitted means the tool has not been migrated yet and owns
   * its own arrangement — the layout shell leaves it alone.
   */
  layout?: AppLayout;
  /** Only meaningful with a layout: caps and centres the stage. */
  layoutWidth?: AppLayoutWidth;
  /** Only meaningful with `split-rail`: rail width in px (default 320). */
  layoutRail?: AppLayoutRail;
  /** Only meaningful with `split-rail`: put the rail before the workspace. */
  layoutRailFirst?: boolean;
  implemented: boolean;
  shortDescription: string;
  longDescription: string;
  appUrl: string;
  landingUrl: string;
  tags: string[];
  features: string[];
  faq: AppFaq[];
  /** Expanded FAQ (5-7 Q&A) shown below the fold and used for FAQPage schema when present. */
  faqExpanded?: AppFaq[];
  /** Extended content for the "Learn more" modal (how to use, use cases, limitations, privacy). */
  content?: AppContent;
  disclaimer?: string;
  seo: AppSeo;
}
