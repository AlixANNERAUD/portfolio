import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "node-html-parser";
import { byScore, featuredProjects, projects } from "../src/data/projects.ts";
import { ui } from "../src/i18n/ui.ts";

/**
 * Build-output smoke tests for the bilingual Astro site.
 * The test intentionally parses generated HTML instead of trusting only config.
 */
const dist = resolve("dist");
const cases = [
  ["index.html", "/", "/fr/"],
  ["fr/index.html", "/fr/", "/"],
  ["projects.html", "/projects", "/fr/projects"],
  ["fr/projects.html", "/fr/projects", "/projects"],
  ["projects/xila.html", "/projects/xila", "/fr/projects/xila"],
  ["fr/projects/xila.html", "/fr/projects/xila", "/projects/xila"],
  ["experiences.html", "/experiences", "/fr/experiences"],
  ["fr/experiences.html", "/fr/experiences", "/experiences"],
  ["skills.html", "/skills", "/fr/skills"],
  ["fr/skills.html", "/fr/skills", "/skills"],
  ["resume.html", "/resume", "/fr/resume"],
  ["fr/resume.html", "/fr/resume", "/resume"],
  ["legal-notice.html", "/legal-notice", "/fr/legal-notice"],
  ["fr/legal-notice.html", "/fr/legal-notice", "/legal-notice"],
];

// Test EVERY static detail route, including alternate locale metadata.
const projectIds = projects.map((project) => project.id);
for (const id of projectIds) {
  {
    cases.push([
      `projects/${id}.html`,
      `/projects/${id}`,
      `/fr/projects/${id}`,
    ]);
    cases.push([
      `fr/projects/${id}.html`,
      `/fr/projects/${id}`,
      `/projects/${id}`,
    ]);
  }
}
for (const removed of ["projects/archive.html", "fr/projects/archive.html"]) {
  if (existsSync(resolve(dist, removed))) {
    throw new Error("The old project archive was published: " + removed);
  }
}

const required = [
  /<meta[^>]+property="og:title"/,
  /<meta[^>]+property="og:description"/,
  /<meta[^>]+property="og:image"/,
  /<meta[^>]+name="twitter:card"/,
  /<meta[^>]+name="description"/,
];

const failed = [];

/**
 * Every page preloads exactly one font file, and it must be a Newsreader face
 * declared in the same document; other families load on demand.
 */
function checkFontPreload(file, html) {
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) {
    failed.push(file + ": missing </head>");
    return;
  }
  const head = html.slice(0, headEnd);
  const fontPreloads = [...head.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => /\brel="preload"/.test(tag) && /\bas="font"/.test(tag));
  if (fontPreloads.length !== 1) {
    failed.push(
      file +
        ": expected exactly one font preload, found " +
        fontPreloads.length,
    );
    return;
  }
  const href = fontPreloads[0].match(/\bhref="([^"]+)"/)?.[1];
  const face = [...html.matchAll(/@font-face\s*\{([^}]*)\}/g)]
    .map(([, body]) => body)
    .find((body) => href && body.includes('url("' + href + '")'));
  const family = face?.match(/font-family:\s*"?([^;"]+)/)?.[1] ?? "";
  if (!family.startsWith("Newsreader")) {
    failed.push(
      file + ": preloaded font " + href + " is not a Newsreader face",
    );
  }
}
/** File contents, or "" after recording the missing file as a failure. */
function read(file) {
  const filename = resolve(dist, file);
  if (!existsSync(filename)) {
    failed.push("Missing output: " + file);
    return "";
  }
  return readFileSync(filename, "utf8");
}

/** The root 404 page only, never a page whose slug merely contains "404". */
const isNotFoundPage = (url) =>
  /^\/404(\.html)?\/?$/.test(new URL(url).pathname);

/** Every header locale switch must lead to a page that was built. */
function checkLocaleSwitch(file, root) {
  const links = root.querySelectorAll("a.site-locale");
  if (links.length !== 1) {
    failed.push(file + ": expected one locale switch, found " + links.length);
    return;
  }
  const href = links[0].getAttribute("href") ?? "";
  const target = href.endsWith("/") ? href + "index.html" : href + ".html";
  if (!href.startsWith("/") || !existsSync(resolve(dist, target.slice(1)))) {
    failed.push(file + ": locale switch links to a missing page " + href);
  }
}

/**
 * Header shell: a menu button bound to the main navigation (collapsed in the
 * HTML, so the no-JS fallback is the CSS), and light/dark theme-color metas.
 */
function checkHeader(file, root) {
  const button = root.querySelector("button.site-menu-button");
  const controls = button?.getAttribute("aria-controls");
  if (!button || button.getAttribute("aria-expanded") !== "false") {
    failed.push(file + ': expected a menu button with aria-expanded="false"');
  } else if (!controls || !root.querySelector("nav#" + controls)) {
    failed.push(file + ": menu button aria-controls must name the main nav");
  }
  const themeColors = root
    .querySelectorAll('head meta[name="theme-color"]')
    .map((tag) => tag.getAttribute("media") ?? "");
  for (const scheme of ["light", "dark"]) {
    if (!themeColors.includes("(prefers-color-scheme: " + scheme + ")")) {
      failed.push(file + ": missing a " + scheme + " theme-color meta");
    }
  }
}

// Head metadata is parsed, not matched as text: navigation links to the
// other locale must not satisfy a canonical or hreflang assertion.
const site = "https://alix.anneraud.fr";
const pagesByCanonical = new Map();
for (const [file, canonicalPath, translationPath] of cases) {
  const html = read(file);
  if (!html) continue;
  if (file.startsWith("projects/") || file.startsWith("fr/projects/")) {
    const headings = [...html.matchAll(/<h1(?:\s|>)/g)];
    if (headings.length !== 1) {
      failed.push(
        file + ": expected exactly one project H1, found " + headings.length,
      );
    }
    if (html.includes("/projects/archive")) {
      failed.push(file + ": legacy archive link found");
    }
  }
  for (const pattern of required) {
    if (!pattern.test(html)) failed.push(file + ": missing " + pattern);
  }
  checkFontPreload(file, html);
  const root = parse(html);
  checkLocaleSwitch(file, root);
  checkHeader(file, root);
  const head = root.querySelector("head");
  if (!head) {
    failed.push(file + ": missing <head>");
    continue;
  }
  const french = file.startsWith("fr/");
  const canonical = site + canonicalPath;
  const expected = {
    en: site + (french ? translationPath : canonicalPath),
    fr: site + (french ? canonicalPath : translationPath),
  };
  expected["x-default"] = expected.en;
  pagesByCanonical.set(canonical, expected);

  const canonicals = head
    .querySelectorAll('link[rel="canonical"]')
    .map((link) => link.getAttribute("href"));
  if (canonicals.length !== 1 || canonicals[0] !== canonical) {
    failed.push(
      file + ": expected one canonical " + canonical + ", found " + canonicals,
    );
  }
  for (const [code, href] of Object.entries(expected)) {
    const found = head
      .querySelectorAll('link[rel="alternate"]')
      .filter((link) => link.getAttribute("hreflang") === code)
      .map((link) => link.getAttribute("href"));
    if (found.length !== 1 || found[0] !== href) {
      failed.push(
        file + ": expected hreflang " + code + " " + href + ", found " + found,
      );
    }
  }
  const meta = (property) =>
    head
      .querySelectorAll('meta[property="' + property + '"]')
      .map((tag) => tag.getAttribute("content"));
  if (head.querySelector('meta[name="robots"]')) {
    failed.push(file + ": indexable page declares a robots meta");
  }
  if (meta("og:url")[0] !== canonical) {
    failed.push(file + ": og:url differs from the canonical URL");
  }
  const locale = french ? "fr_FR" : "en_US";
  const otherLocale = french ? "en_US" : "fr_FR";
  if (meta("og:locale").join() !== locale) {
    failed.push(file + ": expected og:locale " + locale);
  }
  if (meta("og:locale:alternate").join() !== otherLocale) {
    failed.push(file + ": expected og:locale:alternate " + otherLocale);
  }
  const isProject = /^(fr\/)?projects\/.+\.html$/.test(file);
  const ogType = isProject ? "article" : "website";
  if (meta("og:type").join() !== ogType) {
    failed.push(file + ": expected og:type " + ogType);
  }
  const title = head.querySelector("title")?.text ?? "";
  const homeTitle = {
    "index.html": "Alix ANNERAUD | Software, Rust and embedded systems",
    "fr/index.html": "Alix ANNERAUD | Logiciel, Rust et systèmes embarqués",
  }[file];
  if (homeTitle ? title !== homeTitle : !title.endsWith(" | Alix ANNERAUD")) {
    failed.push(file + ": unexpected title format: " + title);
  }
}

// The bilingual 404 page is served for every unknown path, so it must not
// be indexed nor claim a canonical URL or locale alternates.
{
  const html = read("404.html");
  checkFontPreload("404.html", html);
  const root = parse(html);
  checkLocaleSwitch("404.html", root);
  checkHeader("404.html", root);
  const head = root.querySelector("head");
  const robots = head?.querySelectorAll('meta[name="robots"]') ?? [];
  if (robots.length !== 1 || robots[0].getAttribute("content") !== "noindex") {
    failed.push(
      '404.html: expected one <meta name="robots" content="noindex">',
    );
  }
  if (head?.querySelector('link[rel="canonical"]')) {
    failed.push("404.html: must not declare a canonical URL");
  }
  if (head?.querySelector("link[hreflang]")) {
    failed.push("404.html: must not declare hreflang alternates");
  }
  if (head?.querySelector('meta[property="og:url"]')) {
    failed.push("404.html: must not declare an og:url");
  }
  for (const lang of ["en", "fr"]) {
    if (!root.querySelector('main [lang="' + lang + '"]')) {
      failed.push("404.html: missing a lang=" + lang + " content section");
    }
  }
}

// Every sitemap URL is a page canonical with en/fr alternates equal to the
// page hreflang links, and every indexable page is listed exactly once.
{
  const index = parse(read("sitemap-index.xml"));
  const sitemapFiles = index
    .getElementsByTagName("loc")
    .map((loc) => loc.text.trim().replace(site + "/", ""));
  if (!sitemapFiles.length) failed.push("sitemap-index.xml: no sitemap listed");
  const listed = new Set();
  for (const sitemapFile of sitemapFiles) {
    for (const url of parse(read(sitemapFile)).getElementsByTagName("url")) {
      const loc = url.getElementsByTagName("loc")[0]?.text.trim() ?? "";
      if (listed.has(loc)) failed.push("sitemap: duplicate " + loc);
      listed.add(loc);
      const expected = pagesByCanonical.get(loc);
      if (!expected) {
        failed.push("sitemap: " + loc + " is not a page canonical URL");
        continue;
      }
      const links = url.getElementsByTagName("xhtml:link");
      for (const code of ["en", "fr", "x-default"]) {
        const found = links
          .filter((link) => link.getAttribute("hreflang") === code)
          .map((link) => link.getAttribute("href"));
        if (found.length !== 1 || found[0] !== expected[code]) {
          failed.push(
            "sitemap: " +
              loc +
              " expected " +
              code +
              " alternate " +
              expected[code] +
              ", found " +
              found,
          );
        }
      }
    }
  }
  for (const canonical of pagesByCanonical.keys()) {
    if (!listed.has(canonical)) failed.push("sitemap: missing " + canonical);
  }
  if (!listed.has(site + "/fr/"))
    failed.push("sitemap: missing " + site + "/fr/");
  if (listed.has(site + "/fr")) failed.push("sitemap: lists " + site + "/fr");
  for (const loc of listed) {
    if (isNotFoundPage(loc)) failed.push("sitemap: lists the 404 page " + loc);
  }
}
for (const file of ["index.html", "fr/index.html"]) {
  const html = read(file);
  if (!html.includes("application/ld+json") || !html.includes("schema.org")) {
    failed.push(file + ": missing Person structured data");
  }
}
// Home is an engineering portfolio, not an Xila-only landing page.
// Professional experience and a broad project selection must precede
// the explicitly labelled Xila architecture deep dive in both locales.
for (const [file, experienceUrl] of [
  ["index.html", "/experiences"],
  ["fr/index.html", "/fr/experiences"],
]) {
  const html = read(file);
  const marks = [
    'class="home-hero"',
    'class="home-experience"',
    'class="home-experience-grid"',
    'class="portfolio-showcase"',
    'class="xila-topology"',
  ];
  const positions = marks.map((part) => html.indexOf(part));
  if (
    positions.some((index) => index < 0) ||
    positions.some((index, i) => i > 0 && index <= positions[i - 1])
  ) {
    failed.push(file + ": homepage sections missing or in the wrong order");
  }
  if ([...html.matchAll(/class="home-experience-card"/g)].length !== 4) {
    failed.push(file + ": expected four featured professional cards");
  }
  for (const id of ["memo-bank", "linkt", "amazon", "nyu"]) {
    if (!html.includes(experienceUrl + "#" + id + "-title")) {
      failed.push(file + ": missing professional milestone link for " + id);
    }
  }
  for (const { id: project } of featuredProjects) {
    const prefix = file.startsWith("fr/") ? "/fr/projects/" : "/projects/";
    if (!html.includes(prefix + project)) {
      failed.push(file + ": missing selected project " + project);
    }
  }
  if (!/Xila[^<]{0,140}/i.test(html) || !html.includes("xila-topology-link")) {
    failed.push(
      file + ": Xila graph must be presented as a named project deep dive",
    );
  }
  if ([...html.matchAll(/<h1(?:\s|>)/g)].length !== 1) {
    failed.push(file + ": homepage should have exactly one H1");
  }
}

// The immersive introduction must be purely typographic, full-height styled
// and provide an accessible path to the real career content in BOTH locales.
for (const [file, language, careerLink] of [
  ["index.html", "en", "/experiences"],
  ["fr/index.html", "fr", "/fr/experiences"],
]) {
  const html = read(file);
  const heroStart = html.indexOf('<section class="home-hero"');
  const careerStart = html.indexOf('<section class="home-experience"');
  const hero =
    heroStart >= 0 && careerStart > heroStart
      ? html.slice(heroStart, careerStart)
      : "";
  if (
    !hero.includes("home-hero-title-mask") ||
    !hero.includes("home-hero-title-line--accent")
  ) {
    failed.push(file + ": animated editorial title is missing");
  }
  if (
    !hero.includes('href="#career-highlights"') ||
    !hero.includes("home-hero-scroll")
  ) {
    failed.push(file + ": accessible scroll cue to career section is missing");
  }
  if (
    !hero.includes('href="' + careerLink + '"') ||
    !hero.includes(language === "fr" ? "/fr/projects" : "/projects") ||
    !hero.includes("mailto:alix@anneraud.fr")
  ) {
    failed.push(file + ": professional, projects or contact CTAs missing");
  }
  // The name belongs to the single H1 so the page heading identifies its owner.
  const h1 = hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  const h1Text = h1
    ? h1[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
  if (!h1Text.includes("Alix ANNERAUD")) {
    failed.push(file + ": homepage H1 must contain Alix ANNERAUD");
  }
  if (!/<em\b[^>]*>[^<]+<\/em>/.test(h1 ? h1[1] : "")) {
    failed.push(file + ": hero accent line must be set in italic <em>");
  }
  if (language === "fr" && /&amp;|&(?!\w+;)/.test(h1 ? h1[1] : "")) {
    failed.push(file + ": French hero accent line must not use an ampersand");
  }
  // WCAG 2.5.3 Label in Name: the scroll link's accessible name must contain
  // its visible text.
  const scroll = hero.match(
    /<a\b(?=[^>]*class="home-hero-scroll")([^>]*)>([\s\S]*?)<\/a>/,
  );
  if (scroll) {
    const visible = scroll[2]
      .replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const label = scroll[1].match(/aria-label="([^"]*)"/);
    if (!visible || (label && !label[1].includes(visible))) {
      failed.push(
        file + ": scroll link aria-label must contain its visible text",
      );
    }
  }
  if (/<img(?:\s|>)/.test(hero) || hero.includes("home-hero-portrait")) {
    failed.push(file + ": homepage hero must not embed the old pixel portrait");
  }
  if (heroStart < 0 || careerStart < 0 || careerStart <= heroStart) {
    failed.push(
      file + ": homepage introduction must come before professional work",
    );
  }
}

// Structural regressions: these pages use one page-level heading and a
// purpose-built layout rather than the legacy Markdown/document components.
for (const [file, marker] of [
  ["projects.html", "portfolio-showcase--catalogue"],
  ["fr/projects.html", "portfolio-showcase--catalogue"],
  ["experiences.html", "career-timeline"],
  ["fr/experiences.html", "career-timeline"],
  ["skills.html", "skills-domain-grid"],
  ["fr/skills.html", "skills-domain-grid"],
]) {
  const html = read(file);
  if (!html) continue;
  const h1Count = [...html.matchAll(/<h1(?:\s|>)/g)].length;
  if (h1Count !== 1) {
    failed.push(file + ": expected exactly one h1, found " + h1Count);
  }
  if (!html.includes(marker)) {
    failed.push(
      file + ": new portfolio layout not SSR-rendered (" + marker + ")",
    );
  }
}

// Shared visual primitives must render as HTML in both locales.
for (const file of [
  "projects.html",
  "fr/projects.html",
  "experiences.html",
  "fr/experiences.html",
  "skills.html",
  "fr/skills.html",
]) {
  const html = read(file);
  if (!html.includes("editorial-hero")) {
    failed.push(file + ": shared editorial hero missing");
  }
  if (!html.includes("editorial-card") || !html.includes("editorial-tags")) {
    failed.push(file + ": shared editorial cards/tags missing");
  }
}
for (const file of [
  "experiences.html",
  "fr/experiences.html",
  "skills.html",
  "fr/skills.html",
]) {
  const html = read(file);
  if (
    !html.includes("editorial-section-heading") ||
    !html.includes("editorial-next")
  ) {
    failed.push(file + ": shared section/CTA missing");
  }
}

// Skills must be real SSR content rather than hidden client-only cards.
for (const [file, projectPrefix] of [
  ["skills.html", "/projects/"],
  ["fr/skills.html", "/fr/projects/"],
]) {
  const html = read(file);
  const cards = [
    ...html.matchAll(/<article[^>]+class="[^"]*skills-domain-card[^"]*"/g),
  ].length;
  if (cards !== 6) {
    failed.push(file + ": expected six skill domain cards, found " + cards);
  }
  if (!html.includes("skills-language-grid") || !html.includes("TOEIC 975")) {
    failed.push(file + ": language proficiency section missing");
  }
  for (const id of [
    "xila",
    "nanoexpr",
    "deez-nalyzer",
    "infrastructure",
    "mini-train-store",
  ]) {
    if (!html.includes(projectPrefix + id)) {
      failed.push(file + ": missing evidence link to " + id);
    }
  }
  if (html.includes('class="skill-domain"')) {
    failed.push(file + ": legacy SkillDomain layout still rendered");
  }
}

// Older experiences are complete cards, hidden by one toggle per section.
// All content is SSR-rendered and visible without JavaScript: a module script
// reveals the toggles and collapses the earlier lists. No framework island.
for (const [file, professionalLabel, educationLabel] of [
  ["experiences.html", "Show earlier experience", "Show earlier education"],
  [
    "fr/experiences.html",
    "Voir les expériences précédentes",
    "Voir les formations précédentes",
  ],
]) {
  const html = read(file);
  for (const group of ["professional", "education"]) {
    const list = html.match(
      new RegExp('<ol[^>]*id="earlier-' + group + '"[^>]*>'),
    )?.[0];
    if (list && /\shidden[\s>=]/.test(list)) {
      failed.push(file + ": earlier " + group + " list hidden without JS");
    }
    if (
      !html.includes('id="earlier-' + group + '"') ||
      !html.includes('aria-controls="earlier-' + group + '"')
    ) {
      failed.push(
        file + ": missing earlier " + group + " list or accessible toggle",
      );
    }
  }
  for (const id of [
    "insa-relations",
    "renault-cleon",
    "guenola-sahut",
    "baccalaureat",
    "cambridge-b1",
  ]) {
    if (!html.includes(id + "-title")) {
      failed.push(file + ": older card not present in SSR: " + id);
    }
  }
  if (!html.includes(professionalLabel) || !html.includes(educationLabel)) {
    failed.push(file + ": missing translated group toggle labels");
  }
  if (
    html.includes("career-expand-button") ||
    html.includes("career-card--compact") ||
    html.includes("experience-details-")
  ) {
    failed.push(file + ": old per-card expansion controls must be removed");
  }
}

// Experience logos must appear in both generated locales. This is a
// structural check; browser/network verification of remote assets is separate.
for (const file of ["experiences.html", "fr/experiences.html"]) {
  const html = read(file);
  if (
    !html.includes("career-company-logo") ||
    !html.includes("logo-becquerel-blanc_tournant.jpg")
  ) {
    failed.push(file + ": experience company logo markup missing from SSR");
  }
}

// Project cards: the title link is the single link to the project page and is
// stretched over the card; the number shown is the stable relevance rank;
// the panel uses the category token; an external link carries ↗ and a
// visually hidden "opens in a new tab" note.
{
  const ranks = new Map(
    [...projects].sort(byScore).map((project, index) => [project.id, index]),
  );
  const byId = new Map(projects.map((project) => [project.id, project]));
  for (const [file, lang, expected] of [
    ["index.html", "en", featuredProjects.length],
    ["fr/index.html", "fr", featuredProjects.length],
    ["projects.html", "en", projects.length],
    ["fr/projects.html", "fr", projects.length],
  ]) {
    const html = read(file);
    if (!html) continue;
    const prefix = lang === "fr" ? "/fr/projects/" : "/projects/";
    const cards = parse(html).querySelectorAll(".showcase-card");
    if (cards.length !== expected) {
      failed.push(file + ": expected " + expected + " project cards");
    }
    for (const card of cards) {
      const internal = card
        .querySelectorAll("a[href]")
        .filter((a) => !a.getAttribute("href").startsWith("http"));
      const link = card.querySelector(
        "h2 a.showcase-card-link, h3 a.showcase-card-link",
      );
      const id = link?.getAttribute("href")?.slice(prefix.length);
      if (internal.length !== 1 || !link || !id || !byId.has(id)) {
        failed.push(
          file + ": each card needs one internal link, its title link",
        );
        continue;
      }
      const rank = card.querySelector(".showcase-art-position")?.text.trim();
      if (rank !== String(ranks.get(id) + 1).padStart(2, "0")) {
        failed.push(file + ": card " + id + " is not numbered by its rank");
      }
      const art = card.querySelector(".showcase-art");
      if (
        !art
          ?.getAttribute("style")
          ?.includes("--category-" + byId.get(id).category + ")")
      ) {
        failed.push(
          file + ": card " + id + " panel must use its category token",
        );
      }
      for (const external of card.querySelectorAll('a[target="_blank"]')) {
        const note = external.querySelector(".visually-hidden")?.text.trim();
        if (
          note !== ui[lang]["a11y.newTab"] ||
          !external.querySelector('[aria-hidden="true"]')?.text.includes("↗")
        ) {
          failed.push(file + ": external card link needs ↗ and a new-tab note");
        }
      }
    }
  }
}

// → marks internal links and ↗ external ones: no same-site, anchor or mailto
// link may show the external arrow.
for (const [file] of cases) {
  const html = read(file);
  if (!html) continue;
  for (const link of parse(html).querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!/^(?:\/|#|mailto:)/.test(href)) continue;
    if (link.getAttribute("target") === "_blank") continue;
    if (link.text.includes("↗")) {
      failed.push(file + ": internal link " + href + " uses the ↗ arrow");
    }
  }
}

// The site is all-Astro: no page may ship a hydrated island, and every
// client script stays a small progressive enhancement.
{
  const MAX_SCRIPT_BYTES = 20 * 1024;
  const files = readdirSync(dist, { recursive: true }).map(String);
  for (const file of files.filter((name) => name.endsWith(".html"))) {
    if (/<astro-island\b/.test(read(file))) {
      failed.push(file + ": contains an <astro-island> hydrated component");
    }
  }
  for (const file of files.filter(
    (name) => name.startsWith("_astro/") && name.endsWith(".js"),
  )) {
    const { size } = statSync(resolve(dist, file));
    if (size > MAX_SCRIPT_BYTES) {
      failed.push(file + ": client script is " + size + " bytes (> 20 KB)");
    }
  }
}

if (failed.length) {
  console.error("Static SEO checks failed:\n" + failed.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    "Verified canonical, hreflang, Open Graph and structured data on " +
      cases.length +
      " built pages.",
  );
}
