import type { Locale } from "../i18n/locales.ts";
import { useTranslations } from "../i18n/ui.ts";
import type { Period } from "../data/types.ts";
import { formatPlural } from "./plural.ts";

/** `2019–present` / `Depuis 2019`, `2022–2023`, or a single `2023`. */
export function formatPeriod(period: Period, lang: Locale): string {
  const t = useTranslations(lang);
  if (!period.end || period.end === period.start) return period.start;
  if (period.end === "present") {
    return t("period.ongoing", { start: period.start });
  }
  return t("period.range", { start: period.start, end: period.end });
}

export type CountKey = "project" | "role" | "milestone";

/** `1 projet`, `12 projets`: the noun follows the locale's plural rules. */
export function formatCount(n: number, key: CountKey, lang: Locale): string {
  const t = useTranslations(lang);
  return formatPlural(
    n,
    { one: t(`count.${key}.one`), other: t(`count.${key}.other`) },
    lang,
  );
}
