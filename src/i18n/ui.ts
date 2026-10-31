import type { Locale } from "./locales.ts";

/*
 * UI dictionary. English defines the keys; French must provide every one of
 * them (a missing key is a type error). French values carry their typography
 * literally: U+202F (narrow no-break space) before ; ! ? and U+00A0 (no-break
 * space) before : and inside « ». `{name}` placeholders are filled by `vars`.
 */
const en = {
  "meta.homeTitle": "Alix ANNERAUD | Software, Rust and embedded systems",
  "meta.pageTitle": "{title} | Alix ANNERAUD",
  "meta.ogImageAlt": "Portrait of Alix ANNERAUD",
  "a11y.skipToContent": "Skip to content",
  "nav.home": "Home",
  "nav.main": "Main navigation",
  "nav.experiences": "Experiences",
  "nav.projects": "Projects",
  "nav.skills": "Skills",
  "nav.resume": "Resume",
  /** Short name of this locale, shown on the switcher pointing to it. */
  "locale.short": "EN",
  /** Invitation, written in this locale, to switch to it. */
  "locale.switchTo": "Switch to English",
  "theme.toggle": "Toggle theme",
  "footer.nav": "Footer links",
  "footer.legalNotice": "Legal notice",
  "footer.email": "Email",
  "home.description":
    "Alix ANNERAUD's engineering portfolio: security at Memo Bank, experience at Amazon, Linkt and NYU, Rust systems and open-source projects.",
  "experiences.description":
    "Alix ANNERAUD's experience across software engineering, Rust systems, security, networking and research.",
  "projects.description":
    "Explore Alix ANNERAUD's software and embedded projects, with search and category filters.",
  "skills.description":
    "Alix ANNERAUD's experience with Rust systems, embedded development, backend, web interfaces, infrastructure and security, backed by real projects.",
  "resume.description":
    "Alix ANNERAUD's resume and professional experience in Rust, software systems and security.",
  "resume.pdfTitle": "CV (PDF)",
  "resume.openPdf": "Open PDF",
  "legal.description":
    "Legal information, website hosting, privacy and logo attribution for alix.anneraud.fr.",
  "notFound.title": "Page not found",
  "notFound.description": "The requested portfolio page could not be found.",
  "notFound.body": "The page you requested does not exist.",
  "notFound.back": "Back to homepage",
  "period.ongoing": "{start}–present",
  "period.range": "{start}–{end}",
  "count.project.one": "{count} project",
  "count.project.other": "{count} projects",
  "count.role.one": "{count} role",
  "count.role.other": "{count} roles",
  "category.systems": "Systems",
  "category.software": "Software",
  "category.web": "Web",
  "category.infrastructure": "Infrastructure",
  "category.embedded": "Embedded",
  "category.security": "Security",
  "category.data": "Data / ML",
  "count.milestone.one": "{count} milestone",
  "count.milestone.other": "{count} milestones",
  "next.eyebrow": "Next / 03",
  "legal.logoCreditsId": "logo-credits",
  "experience.ongoing": "Ongoing",
  "experience.technologies": "Technologies and domains",
  "experience.areas": "Areas of work",
  "experience.viewDetail": "View this experience",
  "experiences.eyebrow": "Journey / Experience",
  "experiences.title": "From systems to",
  "experiences.accent": "people.",
  "experiences.intro":
    "I enjoy understanding how things work and building tools that make them more reliable and easier to use. My background connects software, networking, security and research.",
  "experiences.navLabel": "Explore my experience",
  "experiences.professional.title": "Professional experience",
  "experiences.professional.description": "Products, systems and research.",
  "experiences.professional.showEarlier": "Show earlier experience",
  "experiences.professional.hideEarlier": "Hide earlier experience",
  "experiences.education.title": "Education and projects",
  "experiences.education.description":
    "Learning by building practical solutions.",
  "experiences.education.showEarlier": "Show earlier education",
  "experiences.education.hideEarlier": "Hide earlier education",
  "experiences.nextTitle": "What have I built?",
  "experiences.nextDescription":
    "Explore the projects behind these skills, from Xila to self-hosted infrastructure.",
  "experiences.nextLink": "Explore my projects",
  "experiences.logoCredits":
    "Logos and trademarks belong to their respective owners. Sources and credits",
  "home.experience.eyebrow": "Experience / 01",
  "home.experience.title": "Built on real experience.",
  "home.experience.intro":
    "Security, software engineering, networking and research: different environments with the same focus on understanding systems and building useful tools.",
  "home.experience.more": "Explore my experience",
} as const;

export type UIKey = keyof typeof en;

const fr: Record<UIKey, string> = {
  "meta.homeTitle": "Alix ANNERAUD | Logiciel, Rust et systèmes embarqués",
  "meta.pageTitle": "{title} | Alix ANNERAUD",
  "meta.ogImageAlt": "Portrait d’Alix ANNERAUD",
  "a11y.skipToContent": "Aller au contenu",
  "nav.home": "Accueil",
  "nav.main": "Navigation principale",
  "nav.experiences": "Expériences",
  "nav.projects": "Projets",
  "nav.skills": "Compétences",
  "nav.resume": "CV",
  "locale.short": "FR",
  "locale.switchTo": "Passer en français",
  "theme.toggle": "Changer de thème",
  "footer.nav": "Liens du pied de page",
  "footer.legalNotice": "Mentions légales",
  "footer.email": "E-mail",
  "home.description":
    "Portfolio d’Alix ANNERAUD : ingénierie logicielle, sécurité chez Memo Bank, expériences Amazon, Linkt et NYU, systèmes Rust et projets open source.",
  "experiences.description":
    "Parcours professionnel, recherche et formation d’Alix ANNERAUD dans les systèmes Rust, la sécurité, les réseaux et le développement logiciel.",
  "projects.description":
    "Explorez les projets logiciels et embarqués d’Alix ANNERAUD avec recherche et filtres par domaine.",
  "skills.description":
    "Compétences d’Alix ANNERAUD en Rust, systèmes embarqués, backend, développement web, infrastructure et cybersécurité, illustrées par des projets.",
  "resume.description":
    "CV et expériences d’Alix ANNERAUD, ingénieur logiciel spécialisé en Rust, systèmes et sécurité.",
  "resume.pdfTitle": "CV français (PDF)",
  "resume.openPdf": "Ouvrir le PDF",
  "legal.description":
    "Mentions légales, hébergement, confidentialité et crédits des logos du portfolio alix.anneraud.fr.",
  "notFound.title": "Page introuvable",
  "notFound.description": "La page demandée est introuvable.",
  "notFound.body": "Cette page n’existe pas.",
  "notFound.back": "Retour à l’accueil",
  "period.ongoing": "Depuis {start}",
  "period.range": "{start}–{end}",
  "count.project.one": "{count} projet",
  "count.project.other": "{count} projets",
  "count.role.one": "{count} poste",
  "count.role.other": "{count} postes",
  "category.systems": "Systèmes",
  "category.software": "Logiciel",
  "category.web": "Web",
  "category.infrastructure": "Infrastructure",
  "category.embedded": "Embarqué",
  "category.security": "Sécurité",
  "category.data": "Data / ML",
  "count.milestone.one": "{count} étape",
  "count.milestone.other": "{count} étapes",
  "next.eyebrow": "Suite / 03",
  "legal.logoCreditsId": "credits-des-logos",
  "experience.ongoing": "En cours",
  "experience.technologies": "Technologies et domaines",
  "experience.areas": "Domaines pratiqués",
  "experience.viewDetail": "Voir cette expérience",
  "experiences.eyebrow": "Parcours / Expériences",
  "experiences.title": "Des systèmes aux",
  "experiences.accent": "équipes.",
  "experiences.intro":
    "J’aime comprendre comment les choses fonctionnent, puis concevoir les outils qui les rendent plus fiables et plus simples à utiliser. Mon parcours mêle développement, réseaux, sécurité et recherche.",
  "experiences.navLabel": "Explorer mon parcours",
  "experiences.professional.title": "Parcours professionnel",
  "experiences.professional.description":
    "Des produits, des systèmes et de la recherche.",
  "experiences.professional.showEarlier": "Voir les expériences précédentes",
  "experiences.professional.hideEarlier": "Masquer les expériences précédentes",
  "experiences.education.title": "Formation et projets",
  "experiences.education.description":
    "Apprendre en construisant des solutions concrètes.",
  "experiences.education.showEarlier": "Voir les formations précédentes",
  "experiences.education.hideEarlier": "Masquer les formations précédentes",
  "experiences.nextTitle": "Et côté projets ?",
  "experiences.nextDescription":
    "Découvrez les projets qui illustrent ces compétences, de Xila à l’auto-hébergement.",
  "experiences.nextLink": "Découvrir mes projets",
  "experiences.logoCredits":
    "Logos et marques : propriété de leurs organismes respectifs. Sources et crédits",
  "home.experience.eyebrow": "Parcours / 01",
  "home.experience.title": "L’expérience du terrain.",
  "home.experience.intro":
    "Sécurité, développement logiciel, exploitation réseau et recherche : des environnements différents, avec un même souci de comprendre et de construire.",
  "home.experience.more": "Voir tout mon parcours",
};

export const ui = { en, fr } satisfies Record<Locale, Record<UIKey, string>>;

export function useTranslations(
  lang: Locale,
): (key: UIKey, vars?: Record<string, string | number>) => string {
  const dictionary: Record<UIKey, string> = ui[lang];
  return (key, vars) => {
    const text = dictionary[key];
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    );
  };
}
