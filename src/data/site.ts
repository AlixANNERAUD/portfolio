import type { Locale } from "../i18n/locales.ts";

const social = {
  github: "https://github.com/AlixANNERAUD",
  linkedin: "https://www.linkedin.com/in/alix-anneraud/",
  matrix: "https://matrix.to/#/@alix:anneraud.fr",
} as const;

/** Public identity and external endpoints shared by the layout, footer and SEO. */
export const site = {
  url: "https://alix.anneraud.fr",
  name: "Alix ANNERAUD",
  email: "alix@anneraud.fr",
  /** Default social preview image, relative to `url`. */
  image: "/images/alix.webp",
  /** Browser chrome colors: hex equivalents of the --color-bg token. */
  themeColor: { light: "#fdfdff", dark: "#1a1a1e" },
  social,
  /** Profiles listed in the footer, in display order (brand names). */
  profiles: [
    { label: "GitHub", href: social.github },
    { label: "LinkedIn", href: social.linkedin },
    { label: "Matrix", href: social.matrix },
  ],
  /** Public repository of this website, released under the MIT license. */
  source: "https://github.com/AlixANNERAUD/portfolio",
  resumePdf: {
    en: "https://resume.alix.anneraud.fr/Resume.english.pdf",
    fr: "https://resume.alix.anneraud.fr/Resume.français.pdf",
  } satisfies Record<Locale, string>,
  analytics: {
    src: "https://s.anneraud.fr/script.js",
    websiteId: "89a5e147-d520-4293-aa35-f80eb903ae3a",
  },
} as const;
