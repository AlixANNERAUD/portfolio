import { site } from "../data/site.ts";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** `[...lang]` route parameter: `undefined` for the unprefixed default locale. */
export function toParam(lang: Locale): string | undefined {
  return lang === defaultLocale ? undefined : lang;
}

/** `getStaticPaths` result for a page that exists once per locale. */
export function localeStaticPaths(): {
  params: { lang: string | undefined };
  props: { lang: Locale };
}[] {
  return locales.map((lang) => ({
    params: { lang: toParam(lang) },
    props: { lang },
  }));
}

/**
 * Maps an English path to its `lang` counterpart.
 * The home page keeps its trailing slash (`/`, `/fr/`); other paths have none.
 */
export function localizePath(enPath: string, lang: Locale): string {
  const clean = enPath.replace(/\/+$/, "");
  if (!clean) return lang === defaultLocale ? "/" : `/${lang}/`;
  return lang === defaultLocale ? clean : `/${lang}${clean}`;
}

/** Absolute URLs of every locale of an English path, plus `x-default`. */
export function alternates(
  enPath: string,
): Record<Locale | "x-default", string> {
  const urls = Object.fromEntries(
    locales.map((lang) => [lang, site.url + localizePath(enPath, lang)]),
  ) as Record<Locale, string>;
  return { ...urls, "x-default": urls[defaultLocale] };
}
