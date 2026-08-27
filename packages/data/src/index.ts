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

export interface AppDefinition {
  slug: string;
  name: string;
  category: string;
  status: AppStatus;
  mode: AppMode;
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
