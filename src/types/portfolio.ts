export type IntroPhase =
  | "awakening"
  | "craneFlight"
  | "transformation"
  | "drumReveal"
  | "portraitReveal"
  | "heroAssembly"
  | "idle";

export type ExpertiseMotionStyle =
  | "architectural-planes"
  | "neural-constellation"
  | "laminar-strata"
  | "orbital-cluster"
  | "vernier-caliper";

export interface ExpertiseCategory {
  id: string;
  index: string;
  elementBadge: string;
  title: string;
  vietnameseLabel: string;
  description: string;
  stackLines: readonly [string, string];
  capabilities: readonly string[];
  motionStyle: ExpertiseMotionStyle;
}

export interface ProjectItem {
  slug: string;
  index: string;
  repo: string;
  title: string;
  subtitle: string;
  description: string;
  architectureNote: string;
  stack: readonly string[];
  thumbnail: string;
  thumbnailAlt: string;
  githubUrl: string;
  liveUrl?: string;
  featured: boolean;
  year: string;
  accentMetric: string;
}

export interface EnterpriseProjectItem {
  code: string;
  region: string;
  period: string;
  title: string;
  organization: string;
  summary: string;
  highlights: readonly string[];
  stack: readonly string[];
  liveUrl?: string;
}

export type JourneyMotif = "sun" | "crane" | "chain" | "comb";

export interface ExperienceMilestone {
  id: string;
  era: string;
  watermarkYear: string;
  role: string;
  organization: string;
  location: string;
  regionTag: string;
  summary: string;
  achievements: readonly string[];
  technologies: readonly string[];
  motif: JourneyMotif;
}

export interface EducationItem {
  institution: string;
  period: string;
  degree: string;
  distinction?: string;
  detail: string;
}

export interface HonorItem {
  year: string;
  title: string;
  issuer: string;
  tier: "national" | "city" | "academic";
}

export interface PortfolioConfig {
  identity: {
    name: string;
    fullName: string;
    handle: string;
    monogram: string;
    greeting: string;
    heritageTagline: string;
    yearsExperience: string;
    globalMarkets: readonly string[];
    spokenLanguages: string;
    titles: readonly string[];
    introLines: readonly string[];
    latelyNote: string;
    biography: string;
    location: string;
    coordinates: string;
    primaryStack: string;
    stackList: readonly string[];
    portrait: {
      src: string;
      alt: string;
      isPlaceholder: boolean;
      replacementNote: string;
    };
    availability: string;
  };
  links: {
    github: string;
    linkedin: string;
    email: string;
    resumeUrl: string;
  };
  github: {
    username: string;
    ignoredLanguages: readonly string[];
    topLanguagesCount: number;
  };
  expertise: {
    eyebrow: string;
    heading: string;
    subheading: string;
    categories: readonly ExpertiseCategory[];
  };
  projects: {
    eyebrow: string;
    heading: string;
    subheading: string;
    items: readonly ProjectItem[];
    enterpriseEyebrow: string;
    enterpriseHeading: string;
    enterpriseDossier: readonly EnterpriseProjectItem[];
  };
  experience: {
    eyebrow: string;
    heading: string;
    subheading: string;
    milestones: readonly ExperienceMilestone[];
    education: readonly EducationItem[];
    honors: readonly HonorItem[];
  };
  contact: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    closingMotto: string;
  };
  seo: {
    title: string;
    description: string;
    siteUrl: string;
    keywords: readonly string[];
    ogImage: string;
  };
}
