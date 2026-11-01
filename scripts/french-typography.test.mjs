import { test } from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml } from "satteri";
import frenchTypographyPlugin, {
  findFrenchTypographyIssues,
  typesetFrench,
  typesetFrenchText,
} from "../src/lib/rehype-french-typography.mjs";
import projectTitlePlugin from "../src/lib/project-title-plugin.mjs";

const NNBSP = " ";
const NBSP = " ";

/** Renders Markdown as Astro does (smart punctuation on) for a given file. */
function render(markdown, path = "/site/src/content/projects/fr/demo.md") {
  const fileURL = new URL("file://" + path);
  return markdownToHtml(markdown, {
    hastPlugins: [frenchTypographyPlugin],
    features: { smartPunctuation: true },
    fileURL,
  }).html.trim();
}

test("typesetFrench applies spaces, quotes and ordinals", () => {
  assert.deepEqual(typesetFrench('Bonjour : test ; ok ? "citation" 3ème'), [
    `Bonjour${NBSP}: test${NNBSP}; ok${NNBSP}? «${NBSP}citation${NBSP}» 3`,
    { sup: "e" },
  ]);
});

test("typesetFrench inserts missing spaces and normalises existing ones", () => {
  assert.deepEqual(typesetFrench("Vraiment! Et toi? Oui; non: peut-être."), [
    `Vraiment${NNBSP}! Et toi${NNBSP}? Oui${NNBSP}; non${NBSP}: peut-être.`,
  ]);
  assert.deepEqual(typesetFrench(`Quoi${NBSP}?! « déjà »`), [
    `Quoi${NNBSP}?! «${NBSP}déjà${NBSP}»`,
  ]);
  assert.deepEqual(typesetFrench("“citation”"), [`«${NBSP}citation${NBSP}»`]);
});

test("typesetFrench rewrites ordinals into superscripts", () => {
  assert.deepEqual(typesetFrench("1ère, 1er, 2e et 36ème places"), [
    "1",
    { sup: "re" },
    ", 1",
    { sup: "er" },
    ", 2",
    { sup: "e" },
    " et 36",
    { sup: "e" },
    " places",
  ]);
});

test("typesetFrench leaves URLs, times, ratios and numbers alone", () => {
  for (const text of [
    "voir https://example.org/a?b=1&c=d!e",
    "le site www.example.org/?q=1",
    "à 10:30, format 16:9",
    "1e10 et 0x1e",
    "std::vec et C::f",
  ]) {
    assert.deepEqual(typesetFrench(text), [text], text);
  }
  assert.deepEqual(typesetFrench("Lien : https://example.org/?x=1 !"), [
    `Lien${NBSP}: https://example.org/?x=1${NNBSP}!`,
  ]);
});

test("typesetFrench handles punctuation right after an inline element", () => {
  assert.deepEqual(typesetFrench(": la suite", { afterInline: true }), [
    `${NBSP}: la suite`,
  ]);
  assert.deepEqual(typesetFrench(": la suite"), [": la suite"]);
  assert.deepEqual(typesetFrench(" ? oui", { afterInline: true }), [
    `${NNBSP}? oui`,
  ]);
});

test("the plugin typesets French Markdown and skips code", () => {
  assert.equal(
    render('Bonjour : test ; ok ? "citation" 3ème et `a ? b : c` !'),
    `<p>Bonjour${NBSP}: test${NNBSP}; ok${NNBSP}? «${NBSP}citation${NBSP}» 3<sup>e</sup> et <code>a ? b : c</code>${NNBSP}!</p>`,
  );
  assert.equal(
    render("```\nx ? y : z;\n```"),
    "<pre><code>x ? y : z;\n</code></pre>",
  );
  assert.equal(
    render("**Contact :** moi, *Note*: ok"),
    `<p><strong>Contact${NBSP}:</strong> moi, <em>Note</em>${NBSP}: ok</p>`,
  );
});

test("the plugin only applies to French files", () => {
  assert.equal(
    render("Hello: world?", "/site/src/content/projects/en/demo.md"),
    "<p>Hello: world?</p>",
  );
  assert.equal(
    render("Contact : moi", "/site/src/content/legal/fr.md"),
    `<p>Contact${NBSP}: moi</p>`,
  );
  assert.equal(
    render("Contact : moi", "/site/src/content/legal/en.md"),
    "<p>Contact : moi</p>",
  );
});

test("typesetFrenchText keeps plain text ordinals", () => {
  assert.equal(
    typesetFrenchText("Xila : la 1ère version"),
    "Xila\u00a0: la 1re version",
  );
});

test("lifted French project titles are typeset", () => {
  const title = (path) => {
    const frontmatter = {};
    markdownToHtml("# Xila : l'OS\n\nTexte", {
      mdastPlugins: [projectTitlePlugin],
      features: { smartPunctuation: true },
      fileURL: new URL("file://" + path),
      data: { astro: { frontmatter } },
    });
    return frontmatter.pageTitle;
  };
  assert.equal(
    title("/site/src/content/projects/fr/xila.mdx"),
    "Xila\u00a0: l’OS",
  );
  assert.equal(title("/site/src/content/projects/en/xila.mdx"), "Xila : l’OS");
});

test("findFrenchTypographyIssues reports source strings to fix", () => {
  assert.deepEqual(
    findFrenchTypographyIssues(
      `Bonjour${NBSP}: test${NNBSP}; ok${NNBSP}? «${NBSP}citation${NBSP}» 3e`,
    ),
    [],
  );
  assert.deepEqual(findFrenchTypographyIssues("https://x.fr/?a=1 à 10:30"), []);
  assert.equal(findFrenchTypographyIssues("Bonjour : test").length, 1);
  assert.equal(findFrenchTypographyIssues("Bonjour: test").length, 1);
  assert.equal(findFrenchTypographyIssues("ok ?").length, 1);
  assert.equal(findFrenchTypographyIssues(`ok${NBSP}!`).length, 1);
  assert.equal(findFrenchTypographyIssues('un "test"').length, 1);
  assert.equal(findFrenchTypographyIssues("un “test”").length, 1);
  assert.equal(findFrenchTypographyIssues("« test »").length, 2);
  assert.equal(findFrenchTypographyIssues("la 1ère place").length, 1);
  assert.equal(findFrenchTypographyIssues("l'école").length, 1);
  assert.deepEqual(findFrenchTypographyIssues("l’école"), []);
});
