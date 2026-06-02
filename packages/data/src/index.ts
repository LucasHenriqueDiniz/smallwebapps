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
  disclaimer?: string;
  seo: AppSeo;
}
