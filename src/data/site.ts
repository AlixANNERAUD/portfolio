import type { Locale } from "../i18n/locales.ts";

/** Public identity and external endpoints shared by the layout, footer and SEO. */
export const site = {
  url: "https://alix.anneraud.fr",
  name: "Alix ANNERAUD",
  email: "alix@anneraud.fr",
  social: {
    github: "https://github.com/AlixANNERAUD",
    linkedin: "https://www.linkedin.com/in/alix-anneraud/",
    matrix: "https://matrix.to/#/@alix:anneraud.fr",
  },
  resumePdf: {
    en: "https://resume.alix.anneraud.fr/Resume.english.pdf",
    fr: "https://resume.alix.anneraud.fr/Resume.français.pdf",
  } satisfies Record<Locale, string>,
  analytics: {
    src: "https://s.anneraud.fr/script.js",
    websiteId: "89a5e147-d520-4293-aa35-f80eb903ae3a",
  },
} as const;
