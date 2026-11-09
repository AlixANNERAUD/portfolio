import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { projects } from "../src/data/projects.ts";
import { locales } from "../src/i18n/locales.ts";
import { ui } from "../src/i18n/ui.ts";
import { UI_FILE, sourcesOf, uiEntries } from "../src/lib/sitemap-lastmod.mjs";

const indexable = [
  "",
  "projects",
  "experiences",
  "about",
  "legal-notice",
  ...projects.map((project) => "projects/" + project.id),
];

test("every indexable page maps to existing content sources", () => {
  for (const lang of locales) {
    for (const path of indexable) {
      const sources = sourcesOf(path, lang);
      assert.ok(sources, `${lang} /${path} has sources`);
      // A project page is a .md or a .mdx file; every other file exists.
      const present = sources.files.filter((file) => existsSync(file));
      const project = path.startsWith("projects/");
      assert.equal(
        present.length,
        sources.files.length - (project ? 1 : 0),
        `${lang} /${path}: ${sources.files.join(", ")}`,
      );
      for (const prefix of sources.ui) {
        assert.ok(
          Object.keys(ui[lang]).some((key) => key.startsWith(prefix)),
          `${lang} /${path}: UI prefix ${prefix} matches a key`,
        );
      }
    }
  }
});

test("pages are dated from content, never from presentation", () => {
  for (const lang of locales) {
    for (const path of indexable) {
      for (const file of sourcesOf(path, lang).files) {
        assert.doesNotMatch(
          file,
          /^src\/(components|layouts|styles|lib)\/|^src\/i18n\//,
          `${lang} /${path} is dated from ${file}`,
        );
        assert.match(file, /\.(astro|md|mdx|ts)$/, `${file} is a file`);
      }
    }
  }
});

test("each page lists the data it shows", () => {
  const has = (path, file, lang = "en") =>
    assert.ok(
      sourcesOf(path, lang).files.includes(file),
      `/${path} lists ${file}`,
    );
  for (const file of [
    "src/data/contributions.ts",
    "src/data/projects.ts",
    "src/data/experiences.ts",
    "src/data/skills.ts",
    "src/data/site.ts",
  ]) {
    has("about", file);
  }
  has("", "src/data/projects.ts");
  has("", "src/data/experiences.ts");
  has("projects", "src/data/projects.ts");
  has("experiences", "src/data/experiences.ts");
  has("projects/xila", "src/data/projects.ts");
  has("projects/xila", "src/content/projects/fr/xila.mdx", "fr");
  has("legal-notice", "src/content/legal/fr.md", "fr");
  assert.deepEqual(sourcesOf("about", "en").ui, ["about.", "skills."]);
  assert.ok(sourcesOf("", "fr").ui.includes("home."));
  assert.equal(sourcesOf("unknown", "en"), undefined);
});

test("UI entries are read per locale and prefix, ignoring line wrapping", () => {
  const source = [
    "const en = {",
    '  "home.title": "Hello",',
    "  /** About the page. */",
    '  "about.intro":',
    '    "Short bio",',
    '  "about.title": "About",',
    '  "nav.home": "Home",',
    "};",
    "const fr: Record<UIKey, string> = {",
    '  "about.intro": "Bio courte",',
    "};",
  ].join("\n");
  assert.equal(
    uiEntries(source, "en", ["about."]),
    '"about.intro": "Short bio", "about.title": "About",',
  );
  assert.equal(
    uiEntries(source, "fr", ["about."]),
    '"about.intro": "Bio courte",',
  );
  assert.equal(uiEntries(source, "en", ["projects."]), "");
  // Prettier unwrapping an entry is not a content change.
  const unwrapped = source.replace(
    '"about.intro":\n    "Short bio"',
    '"about.intro": "Short bio"',
  );
  assert.equal(
    uiEntries(unwrapped, "en", ["about."]),
    uiEntries(source, "en", ["about."]),
  );
  // A no-break space is French typography: changing it is a text change.
  const typeset = source.replace("Bio courte", "Bio courte");
  assert.notEqual(
    uiEntries(typeset, "fr", ["about."]),
    uiEntries(source, "fr", ["about."]),
  );
});

test("UI entries read the real dictionary", () => {
  const text = readFileSync(UI_FILE, "utf8");
  for (const lang of locales) {
    const entries = uiEntries(text, lang, ["about.intro"]);
    assert.ok(
      entries.includes(JSON.stringify(ui[lang]["about.intro"])),
      `${lang} about.intro is read`,
    );
    assert.doesNotMatch(entries, /"home\./);
  }
});
