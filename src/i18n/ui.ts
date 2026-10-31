import type { Locale } from "./locales.ts";

/*
 * UI dictionary. English defines the keys; French must provide every one of
 * them (a missing key is a type error). French values carry their typography
 * literally: U+202F (narrow no-break space) before ; ! ? and U+00A0 (no-break
 * space) before : and inside « ». `{name}` placeholders are filled by `vars`.
 */
const en = {
  "meta.homeTitle": "Alix ANNERAUD - Software, Rust and embedded systems",
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
  "notFound.title": "Page not found",
  "notFound.description": "The requested portfolio page could not be found.",
  "notFound.body": "The page you requested does not exist.",
  "notFound.back": "Back to homepage",
} as const;

export type UIKey = keyof typeof en;

const fr: Record<UIKey, string> = {
  "meta.homeTitle": "Alix ANNERAUD - Logiciel, Rust et systèmes embarqués",
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
  "notFound.title": "Page introuvable",
  "notFound.description": "La page demandée est introuvable.",
  "notFound.body": "Cette page n’existe pas.",
  "notFound.back": "Retour à l’accueil",
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
