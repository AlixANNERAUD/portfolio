import { test } from "node:test";
import assert from "node:assert/strict";
import {
  alternates,
  defaultLocale,
  localeStaticPaths,
  locales,
  localizePath,
  toParam,
} from "../src/i18n/locales.ts";
import { ui, useTranslations } from "../src/i18n/ui.ts";
import { site } from "../src/data/site.ts";
import { localize } from "../src/data/types.ts";
import {
  formatCount,
  formatPeriod,
  periodParts,
  sectionLabel,
} from "../src/lib/format.ts";
import {
  RANK_WEIGHTS,
  byScore,
  featuredProjects,
  nextProject,
  projectScore,
  projectUrl,
  projects,
  relatedProjects,
} from "../src/data/projects.ts";
import { technologies } from "../src/data/technologies.ts";
import { experiences } from "../src/data/experiences.ts";
import { skillDomains } from "../src/data/skills.ts";

test("locales: English is the unprefixed default", () => {
  assert.deepEqual([...locales], ["en", "fr"]);
  assert.equal(defaultLocale, "en");
  assert.equal(toParam("en"), undefined);
  assert.equal(toParam("fr"), "fr");
  assert.deepEqual(localeStaticPaths(), [
    { params: { lang: undefined }, props: { lang: "en" } },
    { params: { lang: "fr" }, props: { lang: "fr" } },
  ]);
});

test("localizePath maps English paths to each locale", () => {
  assert.equal(localizePath("/", "en"), "/");
  assert.equal(localizePath("/", "fr"), "/fr/");
  assert.equal(localizePath("/projects", "en"), "/projects");
  assert.equal(localizePath("/projects", "fr"), "/fr/projects");
  assert.equal(localizePath("/projects/xila", "fr"), "/fr/projects/xila");
  assert.equal(localizePath("/projects/", "fr"), "/fr/projects");
  assert.equal(localizePath("/french-tool", "fr"), "/fr/french-tool");
});

test("localizePath rejects relative and already localized paths", () => {
  assert.throws(() => localizePath("projects", "fr"));
  assert.throws(() => localizePath("/fr/projects", "fr"));
  assert.throws(() => localizePath("/fr", "en"));
});

test("alternates returns absolute en, fr and x-default URLs", () => {
  assert.deepEqual(alternates("/"), {
    en: "https://alix.anneraud.fr/",
    fr: "https://alix.anneraud.fr/fr/",
    "x-default": "https://alix.anneraud.fr/",
  });
  assert.equal(alternates("/")["x-default"], "https://alix.anneraud.fr/");
  assert.equal(
    alternates("/projects").fr,
    "https://alix.anneraud.fr/fr/projects",
  );
  assert.equal(
    alternates("/projects")["x-default"],
    "https://alix.anneraud.fr/projects",
  );
});

test("site data exposes the public identity", () => {
  assert.equal(site.url, "https://alix.anneraud.fr");
  assert.equal(site.name, "Alix ANNERAUD");
  assert.equal(site.email, "alix@anneraud.fr");
  for (const href of Object.values(site.social)) {
    assert.match(href, /^https:\/\//);
  }
  for (const lang of locales) {
    assert.match(site.resumePdf[lang], /^https:\/\/.+\.pdf$/);
  }
});

test("localize accepts plain values and localized records", () => {
  assert.equal(localize("Xila", "fr"), "Xila");
  assert.equal(localize({ en: "Projects", fr: "Projets" }, "en"), "Projects");
  assert.equal(localize({ en: "Projects", fr: "Projets" }, "fr"), "Projets");
  assert.deepEqual(localize({ en: [1], fr: [2] }, "fr"), [2]);
});

test("ui dictionary has the same keys in every locale", () => {
  const keys = Object.keys(ui.en).sort();
  assert.ok(keys.length > 0);
  for (const lang of locales) {
    assert.deepEqual(Object.keys(ui[lang]).sort(), keys);
    for (const key of keys) {
      assert.ok(ui[lang][key].trim(), `${lang}.${key} is empty`);
    }
  }
});

test("useTranslations translates and interpolates variables", () => {
  const en = useTranslations("en");
  const fr = useTranslations("fr");
  assert.equal(en("nav.projects"), "Projects");
  assert.equal(fr("nav.projects"), "Projets");
  assert.equal(
    en("meta.pageTitle", { title: "Skills" }),
    "Skills | Alix ANNERAUD",
  );
  assert.equal(
    fr("meta.pageTitle", { title: "Compétences" }),
    "Compétences | Alix ANNERAUD",
  );
  assert.equal(en("meta.pageTitle"), "{title} | Alix ANNERAUD");
  assert.equal(
    fr("experience.compactLinkLabel", { role: "Stagiaire", company: "ACME" }),
    "Stagiaire \u2013 ACME. Voir cette expérience",
  );
});

test("French UI strings use French typographic spaces", () => {
  for (const [key, value] of Object.entries(ui.fr)) {
    assert.doesNotMatch(
      value,
      /[  ][;!?]/,
      `fr.${key}: use U+202F before ; ! ?`,
    );
    assert.doesNotMatch(value, /[  ]:/, `fr.${key}: use U+00A0 before :`);
    assert.doesNotMatch(value, /«[^ ]/, `fr.${key}: U+00A0 after «`);
    assert.doesNotMatch(value, /[^ ]»/, `fr.${key}: U+00A0 before »`);
    assert.doesNotMatch(value, /"/, `fr.${key}: use « » instead of "`);
    assert.doesNotMatch(value, /'/, `fr.${key}: use ’ instead of '`);
  }
});

test("formatPeriod renders ongoing, single-year and closed periods", () => {
  assert.equal(
    formatPeriod({ start: "2019", end: "present" }, "en"),
    "2019\u2013present",
  );
  assert.equal(
    formatPeriod({ start: "2019", end: "present" }, "fr"),
    "Depuis 2019",
  );
  for (const lang of locales) {
    assert.equal(formatPeriod({ start: "2023" }, lang), "2023");
    assert.equal(
      formatPeriod({ start: "2022", end: "2023" }, lang),
      "2022\u20132023",
    );
  }
});

test("periodParts splits the formatted period around its years", () => {
  assert.deepEqual(periodParts({ start: "2019", end: "present" }, "fr"), [
    "Depuis ",
    { year: "2019" },
  ]);
  assert.deepEqual(periodParts({ start: "2022", end: "2023" }, "en"), [
    { year: "2022" },
    "\u2013",
    { year: "2023" },
  ]);
  assert.deepEqual(periodParts({ start: "2023", end: "2023" }, "en"), [
    { year: "2023" },
  ]);
  for (const lang of locales) {
    for (const period of [
      { start: "2019", end: "present" },
      { start: "2022", end: "2023" },
      { start: "2024" },
    ]) {
      const text = periodParts(period, lang)
        .map((part) => (typeof part === "string" ? part : part.year))
        .join("");
      assert.equal(text, formatPeriod(period, lang));
    }
  }
});

test("formatCount pluralizes with Intl.PluralRules", () => {
  assert.equal(formatCount(1, "project", "fr"), "1 projet");
  assert.equal(formatCount(12, "project", "fr"), "12 projets");
  assert.equal(formatCount(0, "project", "fr"), "0 projet");
  assert.equal(formatCount(1, "project", "en"), "1 project");
  assert.equal(formatCount(0, "project", "en"), "0 projects");
  assert.equal(formatCount(4, "role", "en"), "4 roles");
  assert.equal(formatCount(1, "role", "fr"), "1 poste");
  assert.equal(formatCount(4, "milestone", "en"), "4 milestones");
  assert.equal(formatCount(1, "milestone", "fr"), "1 étape");
});

test("sectionLabel numbers sections as NN — Label", () => {
  assert.equal(sectionLabel(0, "Introduction"), "00\u00a0— Introduction");
  assert.equal(sectionLabel(3, "Xila"), "03\u00a0— Xila");
  assert.equal(sectionLabel(12, "Projets"), "12\u00a0— Projets");
});

test("ranking weights total 100 and drive the featured selection", () => {
  assert.equal(
    Object.values(RANK_WEIGHTS).reduce((sum, weight) => sum + weight, 0),
    100,
  );
  assert.equal(featuredProjects.length, 3);
  const best = Math.min(...featuredProjects.map(projectScore));
  for (const project of projects) {
    if (!featuredProjects.includes(project)) {
      assert.ok(projectScore(project) <= best, project.id);
    }
  }
});

test("projectUrl localizes project detail paths", () => {
  assert.equal(projectUrl("xila", "en"), "/projects/xila");
  assert.equal(projectUrl("xila", "fr"), "/fr/projects/xila");
});

test("relatedProjects excludes the project itself", () => {
  const related = relatedProjects("xila");
  assert.equal(related.length, 3);
  assert.ok(related.every((project) => project.id !== "xila"));
  assert.equal(new Set(related.map((project) => project.id)).size, 3);
  assert.equal(relatedProjects("xila", 5).length, 5);
});

test("relatedProjects lists only real matches, at most n", () => {
  for (const project of projects) {
    const related = relatedProjects(project.id);
    assert.ok(related.length >= 1 && related.length <= 3, project.id);
    for (const other of related) {
      assert.ok(
        other.category === project.category ||
          other.tags.some((tag) => project.tags.includes(tag)),
        project.id + " → " + other.id + " is not related",
      );
    }
  }
});

test("project art glyphs are unique", () => {
  const symbols = projects.map((project) => project.symbol);
  assert.equal(new Set(symbols).size, symbols.length);
});

test("experience dates and titles use dashes, not spaced hyphens", () => {
  for (const entry of experiences) {
    for (const lang of locales) {
      for (const value of [entry.period[lang], entry.role[lang]]) {
        assert.ok(!/ - /.test(value), entry.id + ": " + JSON.stringify(value));
      }
      // Numeric ranges take an unspaced en dash, like formatPeriod.
      assert.ok(!/\d\s+–\s*\d/.test(entry.period[lang]), entry.id);
    }
  }
});

test("nextProject follows relevance order, wraps and skips", () => {
  const ranked = [...projects].sort(byScore);
  assert.equal(nextProject(ranked[0].id).id, ranked[1].id);
  assert.equal(nextProject(ranked.at(-1).id).id, ranked[0].id);
  assert.equal(nextProject(ranked[0].id, [ranked[1].id]).id, ranked[2].id);
  const skip = relatedProjects("xila").map((project) => project.id);
  const next = nextProject("xila", skip);
  assert.ok(next.id !== "xila" && !skip.includes(next.id));
});

test("project tags come from the canonical technology list", () => {
  const known = new Set(technologies);
  for (const project of projects) {
    for (const tag of project.tags) assert.ok(known.has(tag), tag);
  }
});

test("homepage experiences are flagged in the data", () => {
  assert.deepEqual(
    experiences.filter((entry) => entry.homepage).map((entry) => entry.id),
    ["memo-bank", "linkt", "amazon", "nyu"],
  );
});

test("skill evidence is a project reference or an explicit link", () => {
  const ids = new Set(projects.map((project) => project.id));
  for (const domain of skillDomains) {
    for (const evidence of domain.examples) {
      if (evidence.kind === "project") {
        assert.ok(ids.has(evidence.projectId), evidence.projectId);
      } else {
        assert.equal(evidence.kind, "link");
        assert.ok(evidence.href && evidence.label.en && evidence.label.fr);
      }
    }
  }
});
