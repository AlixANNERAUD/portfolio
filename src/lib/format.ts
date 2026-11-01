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

/**
 * The same text as `formatPeriod`, with its years as separate parts, so
 * they can be marked up as `<time datetime="2019">`.
 */
export function periodParts(
  period: Period,
  lang: Locale,
): (string | { year: string })[] {
  const start = "\u0001";
  const end = "\u0002";
  const single = !period.end || period.end === period.start;
  const text = formatPeriod(
    {
      start,
      end: single ? undefined : period.end === "present" ? "present" : end,
    },
    lang,
  );
  return text
    .split(/(\u0001|\u0002)/)
    .filter(Boolean)
    .map((part) =>
      part === start
        ? { year: period.start }
        : part === end
          ? { year: period.end! }
          : part,
    );
}

export type CountKey =
  "project" | "role" | "milestone" | "earlierRole" | "earlierMilestone";

/** `1 projet`, `12 projets`: the noun follows the locale's plural rules. */
export function formatCount(n: number, key: CountKey, lang: Locale): string {
  const t = useTranslations(lang);
  return formatPlural(
    n,
    { one: t(`count.${key}.one`), other: t(`count.${key}.other`) },
    lang,
  );
}

/** Two-digit section number derived from the section's position: `03`. */
export function sectionNumber(index: number): string {
  return String(index).padStart(2, "0");
}

/**
 * Numbered section overline, `03 — Xila`. The no-break space keeps the dash
 * on the number's line, as French typography requires.
 */
export function sectionLabel(index: number, label: string): string {
  return `${sectionNumber(index)} — ${label}`;
}
