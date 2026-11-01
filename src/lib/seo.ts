/**
 * Schema.org JSON-LD builders. Every page emits one `@graph`; the Person,
 * WebSite and home ProfilePage keep the same `@id` in both locales. Project
 * nodes inline a minimal Person author and WebSite (same `@id`, name, URL) so
 * each project page's graph stands on its own.
 */
import { experiences } from "../data/experiences.ts";
import { projectRepository, type Project } from "../data/projects.ts";
import { site } from "../data/site.ts";
import { skillDomains } from "../data/skills.ts";
import { technologyLabel, type Technology } from "../data/technologies.ts";
import { localize } from "../data/types.ts";
import { localizePath, locales, type Locale } from "../i18n/locales.ts";
import { useTranslations } from "../i18n/ui.ts";

export type JsonLdNode = Record<string, unknown>;

export const personId = `${site.url}/#person`;
export const websiteId = `${site.url}/#website`;

const ref = (id: string) => ({ "@id": id });
const absolute = (enPath: string, lang: Locale) =>
  site.url + localizePath(enPath, lang);

/** Tags that name a programming language, with the language's own name. */
const programmingLanguages: Partial<Record<Technology, string>> = {
  C: "C",
  C99: "C",
  "C++": "C++",
  "Free Pascal": "Free Pascal",
  Java: "Java",
  JavaScript: "JavaScript",
  Python: "Python",
  Rust: "Rust",
};

const currentRole = experiences.find(
  (entry) => entry.group === "professional" && entry.ongoing,
);
/** Studies in progress: an affiliation, not yet an `alumniOf`. */
const currentStudies = experiences.filter(
  (entry) => entry.group === "education" && entry.ongoing,
);

/**
 * Minimal Person and WebSite nodes for project pages: validators read each page
 * on its own, so a bare `@id` reference would leave the author unnamed.
 */
const personSummary = () => ({
  "@type": "Person",
  "@id": personId,
  name: site.name,
  url: `${site.url}/`,
});
const websiteSummary = () => ({
  "@type": "WebSite",
  "@id": websiteId,
  name: site.name,
  url: `${site.url}/`,
});

export function personLd(lang: Locale): JsonLdNode {
  return {
    "@type": "Person",
    "@id": personId,
    name: site.name,
    url: `${site.url}/`,
    image: site.url + site.image,
    ...(currentRole && {
      jobTitle: currentRole.role[lang],
      worksFor: {
        "@type": "Organization",
        name: localize(currentRole.company, lang),
        url: currentRole.companyUrl,
      },
    }),
    ...(currentStudies.length > 0 && {
      affiliation: currentStudies.map((entry) => ({
        "@type": "EducationalOrganization",
        name: localize(entry.company, lang),
        url: entry.companyUrl,
      })),
    }),
    knowsAbout: skillDomains.map((domain) => domain.title[lang]),
    sameAs: [...site.sameAs],
  };
}

export function websiteLd(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${site.url}/`,
    name: site.name,
    inLanguage: [...locales],
    publisher: ref(personId),
  };
}

export function profilePageLd(lang: Locale): JsonLdNode {
  const url = absolute("/", lang);
  return {
    "@type": "ProfilePage",
    "@id": `${url}#profilepage`,
    url,
    name: useTranslations(lang)("meta.homeTitle"),
    inLanguage: lang,
    isPartOf: ref(websiteId),
    mainEntity: ref(personId),
  };
}

/**
 * The project: `SoftwareSourceCode` when it has a public repository, otherwise
 * `CreativeWork` (no repository nor language claimed).
 */
export function projectLd(
  project: Project,
  lang: Locale,
  description: string,
): JsonLdNode {
  const url = absolute(`/projects/${project.id}`, lang);
  const repository = projectRepository(project);
  const languages = [
    ...new Set(project.tags.flatMap((tag) => programmingLanguages[tag] ?? [])),
  ];
  return {
    "@type": repository ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${url}#project`,
    url,
    name: localize(project.title, lang),
    description,
    inLanguage: lang,
    keywords: project.tags.map((tag) => technologyLabel(tag, lang)),
    // The start year of the project period; no modification date is claimed.
    dateCreated: project.period.start,
    author: personSummary(),
    isPartOf: websiteSummary(),
    ...(repository && {
      codeRepository: repository,
      ...(languages.length && { programmingLanguage: languages }),
    }),
  };
}

/** Trail from the home page; every item carries its absolute URL. */
export function breadcrumbLd(
  items: readonly { name: string; url: string }[],
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** One JSON-LD document; `<` is escaped so the script tag cannot be closed. */
export function serializeGraph(nodes: readonly JsonLdNode[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
}
