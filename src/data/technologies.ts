import type { Locale } from "../i18n/locales.ts";
import type { Localized } from "./types.ts";

/**
 * Canonical project tags. A project tag outside this list is a type error.
 * Proper nouns are shown as written; thematic tags are translated by
 * `technologyLabel`.
 */
export const technologies = [
  "3D printing",
  "Algèbre linéaire",
  "Algorithmique",
  "Ansible",
  "Audio",
  "Battery",
  "C",
  "C ABI",
  "C++",
  "C99",
  "Capteurs",
  "CellViT",
  "CLI",
  "CTF",
  "DCC",
  "Debian",
  "Deep Learning",
  "Django",
  "Docker",
  "DSP",
  "Électronique",
  "ESP32",
  "Free pascal",
  "G-code",
  "i18n",
  "Java",
  "JavaScript",
  "LVGL",
  "Macros",
  "MCU",
  "ML",
  "MQTT",
  "nnU-Net",
  "no_std",
  "Odoo",
  "Parser",
  "PostgreSQL",
  "Proc macros",
  "Python",
  "Recherche",
  "ROS",
  "Rust",
  "S88",
  "Tailwind",
  "TrueNAS",
  "UI",
  "Vue.js",
  "WebAssembly",
  "WXT",
] as const;

export type Technology = (typeof technologies)[number];

/** Translations of the thematic (non-proper-noun) tags. */
const technologyLabels: Partial<Record<Technology, Localized>> = {
  "3D printing": { en: "3D printing", fr: "Impression 3D" },
  "Algèbre linéaire": { en: "Linear algebra", fr: "Algèbre linéaire" },
  Algorithmique: { en: "Algorithms", fr: "Algorithmique" },
  Battery: { en: "Battery", fr: "Batterie" },
  Capteurs: { en: "Sensors", fr: "Capteurs" },
  Électronique: { en: "Electronics", fr: "Électronique" },
  Recherche: { en: "Research", fr: "Recherche" },
};

/** The tag as shown in `lang`. */
export function technologyLabel(tag: Technology, lang: Locale): string {
  return technologyLabels[tag]?.[lang] ?? tag;
}
