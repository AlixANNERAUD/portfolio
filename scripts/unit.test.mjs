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
