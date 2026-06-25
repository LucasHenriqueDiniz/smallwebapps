export type AppMode = "embedded" | "external";
export type AppStatus = "live" | "coming-soon";

export interface AppFaq {
  question: string;
  answer: string;
}

export interface AppSeo {
  title: string;
  description: string;
}

export interface AppContent {
  /** Step-by-step "how to use" instructions, shown in the info modal. */
  howToUse?: string[];
  /** Real-world use cases / scenarios for this tool. */
  useCases?: string[];
  /** Known technical limitations or caveats. */
  limitations?: string[];
  /** Privacy/processing note (e.g. "Your file never leaves your device"). */
  privacy?: string;
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
