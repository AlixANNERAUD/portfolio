import type { Locale } from "../i18n/locales.ts";

/** Message templates for each plural category; `{count}` is replaced. */
export interface PluralForms {
  one: string;
  other: string;
}

/**
 * Picks the template matching the locale's plural rules and fills `{count}`.
 * Dependency-free so that browser scripts can import it without pulling in
 * the whole UI dictionary.
 */
export function formatPlural(
  n: number,
  forms: PluralForms,
  lang: Locale,
): string {
  const form = new Intl.PluralRules(lang).select(n) === "one" ? "one" : "other";
  return forms[form].replace("{count}", new Intl.NumberFormat(lang).format(n));
}
