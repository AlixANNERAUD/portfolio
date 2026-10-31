import { locales, type Locale } from "../i18n/locales.ts";

/** A value written once per locale. */
export type Localized<T = string> = Record<Locale, T>;

function isLocalized<T>(value: T | Localized<T>): value is Localized<T> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return (
    keys.length === locales.length &&
    locales.every((lang) => keys.includes(lang))
  );
}

/** Returns the value for `lang`, or the value itself when it is not localized (proper nouns). */
export function localize<T>(value: T | Localized<T>, lang: Locale): T {
  return isLocalized(value) ? value[lang] : value;
}
