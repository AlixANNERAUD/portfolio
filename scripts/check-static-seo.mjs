import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "node-html-parser";
import {
  byScore,
  featuredProjects,
  projectRepository,
  projects,
  projectUrl,
  relatedProjects,
} from "../src/data/projects.ts";
import { experiences } from "../src/data/experiences.ts";
import { technologies, technologyLabel } from "../src/data/technologies.ts";
import { site as siteData } from "../src/data/site.ts";
import { skillDomains } from "../src/data/skills.ts";
import { formatPeriod } from "../src/lib/format.ts";
import { ui } from "../src/i18n/ui.ts";
import { localizePath as localized } from "../src/i18n/locales.ts";
import { findFrenchTypographyIssues } from "../src/lib/rehype-french-typography.mjs";

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
 * Header shell: a menu button bound to the panel holding the main navigation
 * (collapsed in the HTML, so the no-JS fallback is the CSS), and light/dark
 * theme-color metas.
 */
function checkHeader(file, root) {
  const button = root.querySelector("button.site-menu-button");
  const controls = button?.getAttribute("aria-controls");
  if (!button || button.getAttribute("aria-expanded") !== "false") {
    failed.push(file + ': expected a menu button with aria-expanded="false"');
  } else if (!controls || !root.querySelector("#" + controls + " > nav")) {
    failed.push(file + ": menu button aria-controls must name the nav panel");
  }
  const themeColors = root
    .querySelectorAll('head meta[name="theme-color"]')
    .map((tag) => tag.getAttribute("media") ?? "");
  for (const scheme of ["light", "dark"]) {
    if (!themeColors.includes("(prefers-color-scheme: " + scheme + ")")) {
      failed.push(file + ": missing a " + scheme + " theme-color meta");
    }
  }
  checkThemeMenu(file, root);
}

/**
 * Theme menu: one icon button in the header row, never in the menu panel,
 * that opens a menu of auto, light and dark radio items, in that order. The
 * HTML marks auto as current (the no-JS default follows the system through
 * the CSS) and names the button after it, in the page locale. The head
 * script must apply the stored choice before paint.
 */
function checkThemeMenu(file, root) {
  const lang =
    root.querySelector("html")?.getAttribute("lang") === "fr" ? "fr" : "en";
  const t = ui[lang];
  const menus = root.querySelectorAll("[data-theme-menu]");
  if (menus.length !== 1) {
    failed.push(file + ": expected 1 theme menu, found " + menus.length);
  }
  if (!root.querySelector(".site-header-tools [data-theme-menu]")) {
    failed.push(file + ": the theme menu belongs in the header tools");
  }
  if (root.querySelector("#site-menu-panel [data-theme-menu]")) {
    failed.push(file + ": the menu panel must not hold a theme menu");
  }
  for (const menu of menus) {
    const button = menu.querySelector("button[aria-haspopup]");
    if (
      !button ||
      button.getAttribute("aria-haspopup") !== "menu" ||
      button.getAttribute("aria-expanded") !== "false"
    ) {
      failed.push(
        file + ': theme button needs aria-haspopup="menu", aria-expanded',
      );
      continue;
    }
    const name = t["theme.current"].replace("{choice}", t["theme.auto"]);
    if (button.getAttribute("aria-label") !== name) {
      failed.push(file + ': theme button must be named "' + name + '"');
    }
    const list = root.getElementById(
      button.getAttribute("aria-controls") ?? "",
    );
    if (
      !list ||
      list.getAttribute("role") !== "menu" ||
      !menu.querySelector("#" + list.id)
    ) {
      failed.push(file + ": theme button aria-controls must name its menu");
      continue;
    }
    if (!list.hasAttribute("hidden")) {
      failed.push(file + ": the theme menu must start hidden");
    }
    const items = list.querySelectorAll('[role="menuitemradio"]');
    const values = items.map((item) => item.getAttribute("data-theme-choice"));
    if (values.join() !== "auto,light,dark") {
      failed.push(file + ": theme menu items are " + values.join());
    }
    for (const item of items) {
      const value = item.getAttribute("data-theme-choice");
      const text = item.textContent.trim();
      if (text !== t["theme." + value]) {
        failed.push(file + ": theme item " + value + ' reads "' + text + '"');
      }
      if (item.getAttribute("aria-checked") !== String(value === "auto")) {
        failed.push(file + ": only the auto theme item may be checked in HTML");
      }
      if (item.getAttribute("tabindex") !== "-1") {
        failed.push(file + ": theme items take focus only from the script");
      }
    }
  }
  const head = root.querySelector("head")?.innerHTML ?? "";
  if (!/localStorage\.getItem\("portfolio-theme"\)/.test(head)) {
    failed.push(file + ": the head script must apply the stored theme");
  }
}

// Head metadata is parsed, not matched as text: navigation links to the
// other locale must not satisfy a canonical or hreflang assertion.
const site = "https://alix.anneraud.fr";

/** Width and height of a PNG from its IHDR chunk, or null if not a PNG. */
function pngSize(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature)
    return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** A published PNG asset of the expected size, as a site-root path. */
function checkPng(path, width, height) {
  const filename = resolve(dist, path.slice(1));
  if (!existsSync(filename)) {
    failed.push("Missing asset: " + path);
    return;
  }
  const size = pngSize(readFileSync(filename));
  if (!size || size.width !== width || size.height !== height) {
    failed.push(path + ": expected a " + width + "x" + height + " PNG");
  }
}

// /llms.txt lists every page and project in both locales; security.txt has
// a contact and an expiry less than a year away.
{
  const llms = read("llms.txt");
  if (!llms.startsWith("# " + siteData.name + "\n\n> ")) {
    failed.push("llms.txt: expected an H1 then a > summary");
  }
  for (const lang of ["en", "fr"]) {
    for (const path of [
      "/",
      "/experiences",
      "/projects",
      "/skills",
      "/resume",
      ...projects.map((project) => "/projects/" + project.id),
    ]) {
      const href = site + localized(path, lang);
      if (!llms.includes("](" + href + ")")) {
        failed.push("llms.txt: missing a link to " + href);
      }
    }
  }
  const security = read(".well-known/security.txt");
  const expires = Date.parse(/^Expires: (.+)$/m.exec(security)?.[1]);
  const year = 365 * 24 * 60 * 60 * 1000;
  if (!security.includes("Contact: mailto:" + siteData.email + "\n")) {
    failed.push(".well-known/security.txt: missing the contact");
  }
  if (!(expires > Date.now() && expires < Date.now() + year)) {
    failed.push(".well-known/security.txt: Expires must be within a year");
  }
}

// Social cards (one per locale, since the tagline is translated) and icons.
const ogImages = {
  en: "/images/og-default.png",
  fr: "/images/og-default.fr.png",
};
for (const path of Object.values(ogImages)) checkPng(path, 1200, 630);
checkPng("/images/apple-touch-icon.png", 180, 180);
{
  const favicon = resolve(dist, "images/favicon.svg");
  const svg = existsSync(favicon) ? readFileSync(favicon, "utf8") : "";
  if (!/^<svg\b[^>]*\bviewBox="0 0 \d+ \d+"/.test(svg.trim())) {
    failed.push("/images/favicon.svg: expected an SVG with a viewBox");
  }
  if (!svg.includes("prefers-color-scheme: dark")) {
    failed.push("/images/favicon.svg: expected a dark-scheme variant");
  }
}
{
  // /favicon.ico: 16, 32 and 48px PNG images in an ICO container.
  const file = resolve(dist, "favicon.ico");
  const ico = existsSync(file) ? readFileSync(file) : Buffer.alloc(0);
  const [type, count] =
    ico.length >= 6 ? [ico.readUInt16LE(2), ico.readUInt16LE(4)] : [0, 0];
  const sizes = Array.from({ length: count }, (_, index) => {
    const entry = 6 + 16 * index;
    const offset = ico.readUInt32LE(entry + 12);
    const png = ico.subarray(offset, offset + 8).toString("latin1");
    return png === "\x89PNG\r\n\x1a\n" ? ico.readUInt8(entry) : 0;
  });
  if (type !== 1 || sizes.join() !== "16,32,48") {
    failed.push("/favicon.ico: expected 16, 32 and 48px PNG icons");
  }
}

/**
 * Large social card in the page locale, with its size, type and alt text,
 * plus the ICO and SVG favicons and the Apple touch icon.
 */
function checkSocialMeta(file, head, lang) {
  const meta = (key) =>
    head
      .querySelectorAll(
        'meta[property="' + key + '"], meta[name="' + key + '"]',
      )
      .map((tag) => tag.getAttribute("content"));
  const image = site + ogImages[lang];
  const expected = {
    "og:image": image,
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",
    "og:image:alt": ui[lang]["meta.ogImageAlt"],
    "twitter:card": "summary_large_image",
    "twitter:image": image,
    "twitter:image:alt": ui[lang]["meta.ogImageAlt"],
  };
  for (const [key, value] of Object.entries(expected)) {
    const found = meta(key);
    if (found.length !== 1 || found[0] !== value) {
      failed.push(
        file + ": expected " + key + " " + value + ", found " + found,
      );
    }
  }
  const links = (selector) =>
    head.querySelectorAll(selector).map((link) => link.getAttribute("href"));
  if (links('link[rel="icon"]').join() !== "/favicon.ico,/images/favicon.svg") {
    failed.push(file + ": expected the ICO then the SVG favicon");
  }
  if (
    links('link[rel="icon"][type="image/svg+xml"]').join() !==
    "/images/favicon.svg"
  ) {
    failed.push(file + ": expected one SVG favicon /images/favicon.svg");
  }
  const analytics = new URL(siteData.analytics.src).origin;
  if (links('link[rel="preconnect"]').join() !== analytics) {
    failed.push(file + ": expected one preconnect to " + analytics);
  }
  if (
    links('link[rel="apple-touch-icon"]').join() !==
    "/images/apple-touch-icon.png"
  ) {
    failed.push(file + ": expected one apple-touch-icon");
  }
}
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
  checkSocialMeta(file, head, french ? "fr" : "en");
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
  if (head) checkSocialMeta("404.html", head, "en");
  for (const lang of ["en", "fr"]) {
    if (!root.querySelector('main [lang="' + lang + '"]')) {
      failed.push("404.html: missing a lang=" + lang + " content section");
    }
  }
}

// Every sitemap URL is a page canonical with en/fr alternates equal to the
// page hreflang links, and every indexable page is listed exactly once.
{
  let fullHistory = false;
  try {
    fullHistory =
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
        encoding: "utf8",
        stdio: "pipe",
      }).trim() === "false";
  } catch {}
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
      // <lastmod> comes from Git: every URL has one with the full history,
      // none in a shallow clone.
      const lastmod = url.getElementsByTagName("lastmod")[0]?.text.trim();
      if (fullHistory !== Boolean(lastmod)) {
        failed.push("sitemap: " + loc + " lastmod " + (lastmod ?? "missing"));
      } else if (lastmod && Number.isNaN(Date.parse(lastmod))) {
        failed.push("sitemap: " + loc + " invalid lastmod " + lastmod);
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
// Structured data: each indexable page has one JSON-LD block, a schema.org
// @graph with unique @ids and no raw "<". The homes share the Person,
// WebSite and ProfilePage ids; project pages describe the project
// (SoftwareSourceCode when it has a public repository, otherwise
// CreativeWork) with the named Person as author; every inner page has a
// BreadcrumbList from Home.
{
  const personId = site + "/#person";
  const websiteId = site + "/#website";
  /** The @graph nodes of the page, after recording any malformed block. */
  const graphOf = (file, html) => {
    const blocks = parse(html).querySelectorAll(
      'script[type="application/ld+json"]',
    );
    if (blocks.length !== 1) {
      failed.push(
        file + ": expected one JSON-LD block, found " + blocks.length,
      );
      return [];
    }
    const raw = blocks[0].rawText;
    if (raw.includes("<")) failed.push(file + ': JSON-LD contains a raw "<"');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      failed.push(file + ": invalid JSON-LD: " + error.message);
      return [];
    }
    if (
      data["@context"] !== "https://schema.org" ||
      !Array.isArray(data["@graph"])
    ) {
      failed.push(file + ": JSON-LD must be a https://schema.org @graph");
      return [];
    }
    const ids = data["@graph"].map((node) => node["@id"]).filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      failed.push(file + ": duplicate JSON-LD @id");
    }
    return data["@graph"];
  };
  const ofType = (graph, type) =>
    graph.filter((node) => node["@type"] === type);
  const checkBreadcrumb = (file, graph, expected) => {
    const lists = ofType(graph, "BreadcrumbList");
    const items = lists[0]?.itemListElement ?? [];
    const ok =
      lists.length === 1 &&
      items.length === expected.length &&
      items.every(
        (item, index) =>
          item["@type"] === "ListItem" &&
          item.position === index + 1 &&
          item.name === expected[index].name &&
          item.item === expected[index].item,
      );
    if (!ok) {
      failed.push(
        file +
          ": BreadcrumbList expected " +
          JSON.stringify(expected) +
          ", found " +
          JSON.stringify(lists.map((list) => list.itemListElement)),
      );
    }
  };
  const current = experiences.find(
    (entry) => entry.group === "professional" && entry.ongoing,
  );
  const studying = experiences.filter(
    (entry) => entry.group === "education" && entry.ongoing,
  );
  for (const lang of ["en", "fr"]) {
    const t = ui[lang];
    const prefix = lang === "en" ? "" : "fr/";
    const home = { name: t["nav.home"], item: site + localized("/", lang) };

    // Home: Person, WebSite and ProfilePage with ids shared by both locales.
    {
      const file = prefix + "index.html";
      const graph = graphOf(file, read(file));
      const [person] = ofType(graph, "Person");
      const [website] = ofType(graph, "WebSite");
      const [profile] = ofType(graph, "ProfilePage");
      if (person?.["@id"] !== personId)
        failed.push(file + ": Person @id must be " + personId);
      if (person?.name !== siteData.name) failed.push(file + ": Person name");
      if (person?.jobTitle !== current.role[lang]) {
        failed.push(file + ": Person jobTitle must be " + current.role[lang]);
      }
      if (person?.worksFor?.name !== current.company) {
        failed.push(file + ": Person worksFor must be " + current.company);
      }
      // Studies in progress are an affiliation; alumniOf would claim a degree.
      const affiliation = (person?.affiliation ?? []).map((org) => org.name);
      const expected = studying.map((entry) =>
        typeof entry.company === "string" ? entry.company : entry.company[lang],
      );
      if (JSON.stringify(affiliation) !== JSON.stringify(expected)) {
        failed.push(
          file + ": Person affiliation must list " + JSON.stringify(expected),
        );
      }
      if (person && "alumniOf" in person) {
        failed.push(file + ": Person alumniOf must not list ongoing studies");
      }
      const sameAs = siteData.sameAs;
      if (JSON.stringify(person?.sameAs) !== JSON.stringify(sameAs)) {
        failed.push(file + ": Person sameAs must list site.sameAs");
      }
      if (
        website?.["@id"] !== websiteId ||
        website?.publisher?.["@id"] !== personId
      ) {
        failed.push(
          file +
            ": WebSite must have @id " +
            websiteId +
            " and the Person as publisher",
        );
      }
      if (
        profile?.["@id"] !== home.item + "#profilepage" ||
        profile?.url !== home.item ||
        profile?.inLanguage !== lang ||
        profile?.mainEntity?.["@id"] !== personId ||
        profile?.isPartOf?.["@id"] !== websiteId
      ) {
        failed.push(
          file + ": ProfilePage must be the localized home about the Person",
        );
      }
      if (ofType(graph, "BreadcrumbList").length) {
        failed.push(file + ": home must not have a BreadcrumbList");
      }
    }

    // Listing and static inner pages: Home > page.
    for (const [path, key] of [
      ["/projects", "nav.projects"],
      ["/experiences", "nav.experiences"],
      ["/skills", "nav.skills"],
      ["/resume", "nav.resume"],
      ["/legal-notice", "footer.legalNotice"],
    ]) {
      const file = prefix + path.slice(1) + ".html";
      checkBreadcrumb(file, graphOf(file, read(file)), [
        home,
        { name: t[key], item: site + localized(path, lang) },
      ]);
    }

    // Project pages: project node + Home > Projects > project.
    for (const project of projects) {
      const file = prefix + "projects/" + project.id + ".html";
      const html = read(file);
      const graph = graphOf(file, html);
      const url = site + localized("/projects/" + project.id, lang);
      const name =
        typeof project.title === "string" ? project.title : project.title[lang];
      checkBreadcrumb(file, graph, [
        home,
        { name: t["nav.projects"], item: site + localized("/projects", lang) },
        { name, item: url },
      ]);
      const repository = projectRepository(project);
      const type = repository ? "SoftwareSourceCode" : "CreativeWork";
      const nodes = ofType(graph, type);
      const node = nodes[0];
      const description = parse(html)
        .querySelector('meta[name="description"]')
        ?.getAttribute("content");
      if (
        nodes.length !== 1 ||
        node["@id"] !== url + "#project" ||
        node.url !== url ||
        node.name !== name ||
        node.description !== description ||
        node.inLanguage !== lang ||
        node.author?.["@id"] !== personId ||
        node.author["@type"] !== "Person" ||
        node.author.name !== siteData.name ||
        node.isPartOf?.["@id"] !== websiteId ||
        node.isPartOf["@type"] !== "WebSite" ||
        node.isPartOf.name !== siteData.name
      ) {
        failed.push(
          file +
            ": expected one " +
            type +
            " for the project, authored by the named Person " +
            personId +
            " and part of the named WebSite",
        );
        continue;
      }
      if (
        repository
          ? node.codeRepository !== repository
          : "codeRepository" in node
      ) {
        failed.push(file + ": codeRepository must be the repository URL only");
      }
      if (!repository && "programmingLanguage" in node) {
        failed.push(
          file + ": CreativeWork must not declare a programmingLanguage",
        );
      }
      // Dated from the project data: the start year, in JSON-LD and as a
      // <time> in the meta line; no modification date is claimed.
      if (node.dateCreated !== project.period.start || "dateModified" in node) {
        failed.push(file + ": dateCreated must be the period start year");
      }
      const times = parse(html)
        .querySelectorAll(".project-meta time")
        .map((time) => time.getAttribute("datetime"));
      if (times[0] !== project.period.start) {
        failed.push(file + ": the period must start with a <time> element");
      }
    }
  }
  if (
    parse(read("404.html")).querySelector('script[type="application/ld+json"]')
  ) {
    failed.push("404.html: must not have structured data");
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
// The toggle labels give the real number of earlier cards.
for (const [file, professionalLabel, educationLabel] of [
  ["experiences.html", "Show 3 earlier roles", "Show 2 earlier milestones"],
  [
    "fr/experiences.html",
    "Afficher 3 postes précédents",
    "Afficher 2 étapes précédentes",
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

// Experience logos must appear in both generated locales, every one served
// from this site (no hotlinking) and present in dist.
const expectedLogos = experiences.filter((entry) => entry.logo).length;
for (const file of ["experiences.html", "fr/experiences.html"]) {
  const logos = parse(read(file))
    .querySelectorAll("img.career-company-logo")
    .map((img) => img.getAttribute("src") ?? "");
  const external = logos.filter(
    (src) =>
      !src.startsWith("/images/logos/") ||
      !existsSync(resolve(dist, src.slice(1))),
  );
  if (logos.length !== expectedLogos || external.length) {
    failed.push(
      file +
        ": expected " +
        expectedLogos +
        " self-hosted experience logos, found " +
        logos.length +
        (external.length
          ? "; not self-hosted or missing: " + external.join(", ")
          : ""),
    );
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
        // Hidden text: the project it leads from, then the new-tab note.
        const note = external
          .querySelector(".visually-hidden")
          ?.text.replace(/\s+/g, " ")
          .trim();
        const title = card.querySelector(".showcase-card-link")?.text.trim();
        const expected =
          ui[lang]["project.externalOf"].replace("{title}", title) +
          " " +
          ui[lang]["a11y.newTab"];
        if (
          note !== expected ||
          !external.querySelector('[aria-hidden="true"]')?.text.includes("↗")
        ) {
          failed.push(
            file +
              ": external card link needs ↗, the project name and a new-tab note",
          );
        }
      }
    }
  }
}

// Catalogue polish: the home and catalogue pages never skip a heading level;
// sort options read "Relevance"/"Name"; the grid/list view toggle is a pair
// of aria-pressed buttons inside the script-revealed toolbar, with the index
// list as the default view; the homepage link to the catalogue gives the real
// project count.
{
  for (const file of [
    "index.html",
    "fr/index.html",
    "projects.html",
    "fr/projects.html",
  ]) {
    const html = read(file);
    if (!html) continue;
    let previous = 0;
    for (const heading of parse(html).querySelectorAll(
      "main h1, main h2, main h3, main h4, main h5, main h6",
    )) {
      const level = Number(heading.tagName.slice(1));
      if (level > previous + 1) {
        failed.push(
          file +
            ": heading level skipped (h" +
            previous +
            " → h" +
            level +
            ") at " +
            JSON.stringify(heading.text.trim()),
        );
      }
      previous = level;
    }
  }
  for (const [file, sortLabels, viewLabels] of [
    ["projects.html", ["Relevance", "Name"], ["Grid", "List"]],
    ["fr/projects.html", ["Pertinence", "Nom"], ["Grille", "Liste"]],
  ]) {
    const html = read(file);
    if (!html) continue;
    const root = parse(html);
    const options = root
      .querySelectorAll("select[data-catalogue-sort] option")
      .map((option) => option.text.trim());
    if (options.join("|") !== sortLabels.join("|")) {
      failed.push(file + ": sort options must be " + sortLabels.join(" / "));
    }
    const view = root.querySelectorAll(
      ".showcase-toolbar [data-catalogue-view] button[aria-pressed]",
    );
    if (
      view.length !== 2 ||
      view.map((button) => button.getAttribute("value")).join("|") !==
        "grid|list" ||
      view.map((button) => button.text.trim()).join("|") !==
        viewLabels.join("|") ||
      view[0].getAttribute("aria-pressed") !== "false" ||
      view[1].getAttribute("aria-pressed") !== "true" ||
      root.querySelector("[data-catalogue-grid]")?.getAttribute("data-view") !==
        "list"
    ) {
      failed.push(file + ": missing grid/list view toggle (list by default)");
    }
  }
  for (const [file, label] of [
    ["index.html", "See all " + projects.length + " projects"],
    ["fr/index.html", "Voir les " + projects.length + " projets"],
  ]) {
    const html = read(file);
    if (!html) continue;
    const link = parse(html).querySelector(".showcase-all-link");
    const text = link?.text.replace("→", "").replace(/\s+/g, " ").trim();
    if (text !== label) {
      failed.push(file + ": catalogue link must read " + JSON.stringify(label));
    }
  }
}

// Section numbering: every numbered overline reads "NN / Label", and the
// numbers follow the order of the sections on the page (home: Introduction 00,
// Experience 01, Projects 02, Xila 03). No overline keeps the old "NN / X" or
// "X / NN" format, and the closing link's overline is in the page language.
{
  for (const [file, expected, next] of [
    [
      "index.html",
      ["00 / Introduction", "01 / Experience", "02 / Projects", "03 / Xila"],
      null,
    ],
    [
      "fr/index.html",
      ["00 / Introduction", "01 / Parcours", "02 / Projets", "03 / Xila"],
      null,
    ],
    ["experiences.html", ["01 / ", "02 / "], "Up next"],
    ["fr/experiences.html", ["01 / ", "02 / "], "À suivre"],
    ["skills.html", ["01 / Expertise", "02 / Communication"], "Up next"],
    ["fr/skills.html", ["01 / Expertise", "02 / Communication"], "À suivre"],
  ]) {
    const html = read(file);
    if (!html) continue;
    const root = parse(html);
    const labels = root
      .querySelectorAll("[data-section-index]")
      .map((node) => ({
        index: node.getAttribute("data-section-index"),
        text: node.text.replace(/\s+/g, " ").trim(),
      }));
    const ok =
      labels.length === expected.length &&
      labels.every(
        ({ index, text }, i) =>
          /^\d{2} \/ \S/.test(text) &&
          text.startsWith(index + " / ") &&
          text.startsWith(expected[i]),
      );
    if (!ok) {
      failed.push(
        file +
          ": section numbering must be " +
          JSON.stringify(expected) +
          ", found " +
          JSON.stringify(labels.map(({ text }) => text)),
      );
    }
    for (const node of root.querySelectorAll(
      ".eyebrow, .home-hero-overline-index",
    )) {
      const text = node.text.replace(/\s+/g, " ").trim();
      if (text.includes("\u2014")) {
        failed.push(
          file + ": em dash in a section label " + JSON.stringify(text),
        );
      }
    }
    if (next) {
      const eyebrow = root
        .querySelector(".editorial-next__eyebrow")
        ?.text.replace(/\s+/g, " ")
        .trim();
      if (eyebrow !== next) {
        failed.push(
          file +
            ": next link overline must read " +
            JSON.stringify(next) +
            ", found " +
            JSON.stringify(eyebrow),
        );
      }
    }
  }
}

// Project pages: ProjectLayout renders the breadcrumb, the H1 lifted from the
// Markdown, a meta line from the data (period, type, team, tags), an external
// link named after its target, 2-3 related project cards and a next link. The
// Markdown body no longer repeats the back link, meta line or related links.
{
  const labels = {
    en: {
      breadcrumb: "Breadcrumb",
      home: "Home",
      projects: "Projects",
      group: {
        personal: "Personal project",
        library: "Library",
        competition: "Competition",
        academic: "Academic project",
      },
      team: (n) => "Team of " + n,
      github: "View the GitHub repository",
      visit: (host) => "Visit " + host,
      related: "Related projects",
    },
    fr: {
      breadcrumb: "Fil d’Ariane",
      home: "Accueil",
      projects: "Projets",
      group: {
        personal: "Projet personnel",
        library: "Bibliothèque",
        competition: "Compétition",
        academic: "Projet académique",
      },
      team: (n) => "Équipe de " + n,
      github: "Voir le dépôt GitHub",
      visit: (host) => "Visiter " + host,
      related: "Dans le même domaine",
    },
  };
  const text = (node) => node?.text.replace(/\s+/g, " ").trim() ?? "";
  for (const project of projects) {
    for (const lang of ["en", "fr"]) {
      const l = labels[lang];
      const file =
        (lang === "fr" ? "fr/" : "") + "projects/" + project.id + ".html";
      const html = read(file);
      if (!html) continue;
      const root = parse(html);
      const main = root.querySelector("main");
      const crumbs = main?.querySelector(
        'nav[aria-label="' + l.breadcrumb + '"] ol',
      );
      const items = crumbs?.querySelectorAll("li") ?? [];
      const home = lang === "fr" ? "/fr/" : "/";
      const catalogue = lang === "fr" ? "/fr/projects" : "/projects";
      if (
        items.length !== 3 ||
        items[0].querySelector("a")?.getAttribute("href") !== home ||
        text(items[0]) !== l.home ||
        items[1].querySelector("a")?.getAttribute("href") !== catalogue ||
        text(items[1]) !== l.projects ||
        items[2].querySelector("a") ||
        items[2].querySelector('[aria-current="page"]') === null
      ) {
        failed.push(file + ": breadcrumb must be Home › Projects › current");
      }
      const header = main?.querySelector(".project-header");
      if (!header?.querySelector("h1")) {
        failed.push(file + ": the project H1 belongs to .project-header");
      }
      const meta = text(header?.querySelector(".project-meta"));
      const expectedMeta = [
        formatPeriod(project.period, lang),
        l.group[project.group],
        ...(project.team ? [l.team(project.team)] : []),
      ];
      if (expectedMeta.some((part) => !meta.includes(part))) {
        failed.push(
          file +
            ": meta line must show " +
            JSON.stringify(expectedMeta) +
            ", found " +
            JSON.stringify(meta),
        );
      }
      const tags = header
        ?.querySelectorAll(".editorial-tags li")
        .map((tag) => text(tag));
      const tagLabels = project.tags.map((tag) => technologyLabel(tag, lang));
      if ((tags ?? []).join("|") !== tagLabels.join("|")) {
        failed.push(file + ": meta tags must be the project's data tags");
      }
      const external = header?.querySelectorAll(".project-external");
      if (project.externalUrl) {
        const url = new URL(project.externalUrl);
        const host = url.hostname.replace(/^www\./, "");
        const label = host === "github.com" ? l.github : l.visit(host);
        const link = external?.[0];
        if (
          external?.length !== 1 ||
          link.getAttribute("href") !== project.externalUrl ||
          link.getAttribute("target") !== "_blank" ||
          !text(link).startsWith(label + " ") ||
          !text(link).endsWith("↗")
        ) {
          failed.push(
            file + ": external link must read " + JSON.stringify(label),
          );
        }
      } else if (external?.length) {
        failed.push(file + ": unexpected external link");
      }
      const related = main?.querySelector(".project-related");
      const relatedLinks = related
        ?.querySelectorAll(".showcase-card-link")
        .map((link) => link.getAttribute("href"));
      const expectedRelated = relatedProjects(project.id).map((p) =>
        projectUrl(p.id, lang),
      );
      if (
        text(related?.querySelector("h2")) !== l.related ||
        (relatedLinks ?? []).join("|") !== expectedRelated.join("|")
      ) {
        failed.push(file + ": related projects must list " + expectedRelated);
      }
      const next = main
        ?.querySelector(".editorial-next a")
        ?.getAttribute("href");
      if (
        !next?.startsWith(catalogue + "/") ||
        next === projectUrl(project.id, lang) ||
        expectedRelated.includes(next)
      ) {
        failed.push(file + ": next link must point to another project");
      }
      const body = main?.querySelector(".project-body");
      if (
        !body ||
        body.querySelector("h1") ||
        body
          .querySelectorAll("a")
          .some((link) =>
            [catalogue, ...expectedRelated].includes(link.getAttribute("href")),
          ) ||
        /Related work|Dans le même domaine|← /.test(body.text)
      ) {
        failed.push(
          file + ": Markdown body must not repeat layout navigation or H1",
        );
      }
    }
  }
}

// Resume: one H1, an HTML summary built from the data (roles, education,
// skills), Download/Open buttons for the PDF, an <object> preview with a
// fallback link, and the site footer.
for (const [file, lang] of [
  ["resume.html", "en"],
  ["fr/resume.html", "fr"],
]) {
  const html = read(file);
  if (!html) continue;
  const root = parse(html);
  const main = root.querySelector("main");
  const pdf = siteData.resumePdf[lang];
  if (main?.querySelectorAll("h1").length !== 1) {
    failed.push(file + ": resume must have exactly one H1");
  }
  const summary = main?.querySelector(".resume-summary");
  const summaryText = summary?.text.replace(/\s+/g, " ") ?? "";
  const expected = [
    ...experiences.map((entry) => entry.role[lang]),
    ...skillDomains.map((domain) => domain.title[lang]),
  ];
  const missing = expected.filter((value) => !summaryText.includes(value));
  if (!summary || missing.length) {
    failed.push(file + ": resume summary misses " + JSON.stringify(missing));
  }
  if ((summary?.querySelectorAll("h2").length ?? 0) < 3) {
    failed.push(file + ": resume summary needs experience/education/skills");
  }
  const download = main?.querySelector(
    'a.resume-action[download][href="' + pdf + '"]',
  );
  const open = main?.querySelector(
    'a.resume-action[target="_blank"][href="' + pdf + '"]',
  );
  if (!download || !open) {
    failed.push(file + ": resume needs Download and Open PDF buttons");
  }
  const preview = main?.querySelector(
    'object.resume-preview[type="application/pdf"][data="' + pdf + '"]',
  );
  if (!preview?.querySelector('a[href="' + pdf + '"]')) {
    failed.push(file + ": resume <object> preview with a fallback link");
  }
  if (main?.querySelector("iframe")) {
    failed.push(file + ": resume must not use the old full-page iframe");
  }
  if (!root.querySelector("footer.site-footer")) {
    failed.push(file + ": resume must show the site footer");
  }
}

// Tags speak the page language: an English page shows no French-only tag
// (nor an accented French word) and a French page no English-only tag. The
// translated pairs come from the data, so a new localized tag is covered.
{
  const pairs = [
    ...technologies.map((tag) => ({
      en: technologyLabel(tag, "en"),
      fr: technologyLabel(tag, "fr"),
    })),
    ...[...experiences, ...skillDomains]
      .flatMap((entry) => entry.technologies)
      .filter((tag) => typeof tag === "object"),
  ].filter((pair) => pair.en !== pair.fr);
  const foreign = {
    en: new Set(pairs.map((pair) => pair.fr)),
    fr: new Set(pairs.map((pair) => pair.en)),
  };
  for (const [file] of cases) {
    const html = read(file);
    if (!html) continue;
    const lang = file.startsWith("fr/") ? "fr" : "en";
    for (const tag of parse(html).querySelectorAll(
      "main .editorial-tags li, main .home-experience-tags li, main .resume-inline li",
    )) {
      const text = tag.text.replace(/\s+/g, " ").trim();
      if (
        foreign[lang].has(text) ||
        (lang === "en" && /[àâçéèêëîïôûùüÿœæ]/i.test(text))
      ) {
        failed.push(
          file + ": tag in the wrong language " + JSON.stringify(text),
        );
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

// French pages read as French: every visible text outside code follows the
// typography rules (Markdown bodies via the rehype plugin, UI strings and
// data via validate-portfolio).
for (const file of new Set(
  cases.map(([file]) => file).filter((file) => file.startsWith("fr/")),
)) {
  const html = read(file);
  if (!html) continue;
  const body = parse(html).querySelector("body");
  for (const skipped of body.querySelectorAll(
    "script, style, code, pre, kbd, samp, svg, template",
  )) {
    skipped.remove();
  }
  for (const issue of new Set(findFrenchTypographyIssues(body.text))) {
    failed.push(file + ": French typography: " + issue);
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
