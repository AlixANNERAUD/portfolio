import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  experiences,
  homepageExperiences,
} from "../../src/data/experiences.ts";
import {
  getProject,
  projectIcon,
  projectLogo,
} from "../../src/data/projects.ts";
import { site } from "../../src/data/site.ts";
import { ui } from "../../src/i18n/ui.ts";

/**
 * LinkedIn banner, in the portfolio's identity: the homepage field (the
 * organizations as logo-and-name pills, project glyphs around Xila) next to
 * the site tagline and address.
 *
 *   (cd tools/browser-checks && npm ci && npx playwright install chromium)
 *   node tools/linkedin-banner/render.mjs
 *
 * Writes linkedin-banner-{en,fr}-{light,dark}.png (1584x396, LinkedIn's
 * banner size, at 2x), and the HTML page each is taken from, in
 * tools/linkedin-banner/out/. Colors come from src/styles/tokens.css, fonts
 * from src/assets/fonts/, names, symbols and logos from src/data/, project
 * icons from @lucide/astro. Only the positions are set here: LinkedIn puts the
 * profile photo over the bottom left, so the copy starts to its right and
 * only the dot grid runs under it.
 */

const require = createRequire(
  new URL("../browser-checks/package.json", import.meta.url),
);
const { chromium } = require("playwright");

const repo = new URL("../../", import.meta.url);
const file = (path) => new URL(path, repo).href;
const out = fileURLToPath(new URL("out/", import.meta.url));

const W = 1584;
const H = 396;

/** Organizations: the homepage roles, then the engineering degree. */
const organizations = [
  ...homepageExperiences,
  experiences.find((experience) => experience.id === "insa-engineering"),
];
/** Pill centers, by experience id. */
const pillAt = {
  "memo-bank": [1112, 74],
  linkt: [1428, 66],
  amazon: [1478, 296],
  nyu: [1396, 360],
  "insa-engineering": [1118, 334],
};
/** Glyph tile centers, by project id; Xila sits at the core. */
const tileAt = {
  nanoexpr: [1262, 100],
  "jeanne-hack-2026": [1372, 128],
  "mini-train-store": [1038, 214],
  nanobom: [1540, 178],
  infrastructure: [1178, 262],
  "embedded-i18n": [1352, 256],
  "model-railway": [1540, 58],
};
const CORE = [1270, 198];

const escape = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/**
 * A Lucide icon as inline SVG, from the icon data in its @lucide/astro module
 * (the file the site's ProjectIcon component imports).
 */
function lucide(name) {
  const source = readFileSync(
    new URL(`node_modules/@lucide/astro/src/icons/${name}.ts`, repo),
    "utf8",
  );
  const { node } = JSON.parse(source.match(/LucideIconData = (\{.*\});/)[1]);
  const children = node
    .map(
      ([tag, attrs]) =>
        `<${tag} ${Object.entries(attrs)
          .map(([key, value]) => `${key}="${escape(value)}"`)
          .join(" ")}/>`,
    )
    .join("");
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
}

function glyph(project, [x, y], core = false) {
  const logo = projectLogo(project);
  const icon = projectIcon(project);
  const classes = ["tile"];
  if (core) classes.push("core");
  if (project.logoFillsTile) classes.push("icon");
  if (!icon && [...project.symbol].length > 1) classes.push("wide");
  const content = icon
    ? lucide(icon)
    : logo
      ? `<img src="${file("public" + logo)}" alt="">`
      : escape(project.symbol);
  return `<div class="${classes.join(" ")}" style="left:${x}px;top:${y}px;--cat:var(--category-${project.category})">${content}</div>`;
}

function pill(experience, [x, y]) {
  const plate = experience.logoOnDark ? "plate dark" : "plate";
  return `<div class="pill" style="left:${x}px;top:${y}px"><span class="${plate}"><img src="${file("public" + experience.logo)}" alt=""></span>${escape(experience.company)}</div>`;
}

function page(lang, theme) {
  const t = ui[lang];
  const tagline = t["meta.homeTitle"].split(" | ")[1];
  // Two lines, broken before the conjunction: "Software, Rust / and ...".
  const conjunction = { en: " and ", fr: " et " }[lang];
  const at = tagline.lastIndexOf(conjunction);
  const lines = [tagline.slice(0, at), tagline.slice(at + 1)];
  const monogram = readFileSync(
    new URL("src/assets/monogram.svg", repo),
    "utf8",
  );
  const xila = getProject("xila");
  return `<!doctype html>
<html lang="${lang}" class="${theme}"><head><meta charset="utf-8">
<style>
${readFileSync(new URL("src/styles/tokens.css", repo), "utf8")}
@font-face { font-family: Newsreader; font-weight: 200 800; src: url(${file("src/assets/fonts/newsreader-latin-normal.woff2")}); }
@font-face { font-family: Newsreader; font-weight: 200 800; font-style: italic; src: url(${file("src/assets/fonts/newsreader-latin-italic.woff2")}); }
@font-face { font-family: "JetBrains Mono"; font-weight: 100 800; src: url(${file("src/assets/fonts/jetbrains-mono-latin-normal.woff2")}); }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { position: relative; background: var(--color-bg); color: var(--color-text); }
.mono-font { font-family: "JetBrains Mono", monospace; }
.bar { position: absolute; inset: 0 0 auto; height: 6px; background: var(--color-accent); }
.glow { position: absolute; inset: 0; background: radial-gradient(440px circle at ${CORE[0]}px ${CORE[1]}px, var(--color-accent-soft), transparent 70%); }
.dots { position: absolute; inset: 0; background: radial-gradient(var(--color-border) 1.2px, transparent 1.7px) 0 0 / 24px 24px; mask-image: radial-gradient(ellipse 42% 85% at 80% 50%, #000 40%, transparent 100%), linear-gradient(90deg, rgb(0 0 0 / 0.55), transparent 40%); }
.ring { position: absolute; border: 1.5px dashed var(--color-border); border-radius: 50%; }
.ring.inner { border-style: solid; }
.copy { position: absolute; left: 400px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; }
.overline { font: 500 17px/1 "JetBrains Mono"; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text-muted); }
.tagline { margin-top: 22px; font: italic 400 54px/1.04 Newsreader; font-variation-settings: "opsz" 72; letter-spacing: -0.02em; color: var(--color-accent); }
.rule { position: relative; width: 500px; height: 1px; margin-top: 30px; background: var(--color-border); }
.rule::before { content: ""; position: absolute; left: 0; top: -1px; width: 56px; height: 3px; background: var(--color-accent); }
.url { display: flex; align-items: center; gap: 14px; margin-top: 24px; font: 500 22px/1 "JetBrains Mono"; letter-spacing: 0.06em; text-transform: uppercase; }
.monogram { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 9px; background: var(--color-accent); color: var(--color-bg); }
.monogram svg { width: 24px; height: 24px; }
.tile, .pill { position: absolute; translate: -50% -50%; }
.tile { display: grid; place-items: center; width: 50px; height: 50px; border-radius: 11px; background: var(--cat); color: var(--color-on-category); font: 500 25px/1 "JetBrains Mono"; box-shadow: 0 1px 0 color-mix(in oklch, var(--color-text) 12%, transparent); }
.tile.wide { font-size: 17px; }
.tile img, .tile svg { width: 50%; height: 50%; }
.tile.icon { overflow: hidden; background: none; }
.tile.icon img { width: 100%; height: 100%; }
.tile.core { width: 72px; height: 72px; border-radius: 14px; }
.label { position: absolute; translate: 0 -50%; font: 500 19px/1 "JetBrains Mono"; letter-spacing: 0.02em; }
.pill { display: flex; align-items: center; gap: 9px; height: 42px; padding: 0 15px 0 5px; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-surface); font: 500 14px/1 "JetBrains Mono"; white-space: nowrap; }
.plate { display: grid; place-items: center; height: 32px; padding: 0 9px; border-radius: 999px; background: var(--color-logo-plate); }
.plate.dark { background: var(--color-logo-plate-dark); }
.plate img { display: block; height: 18px; width: auto; }
</style></head>
<body>
<div class="glow"></div>
<div class="dots"></div>
<div class="ring" style="left:985px;top:30px;width:570px;height:336px"></div>
<div class="ring inner" style="left:1150px;top:118px;width:240px;height:160px"></div>
<div class="bar"></div>
<div class="copy">
  <div class="overline">${escape(t["meta.discipline"])}</div>
  <div class="tagline">${lines.map(escape).join("<br>")}</div>
  <div class="rule"></div>
  <div class="url"><span class="monogram">${monogram}</span>${escape(new URL(site.url).host)}</div>
</div>
${glyph(xila, CORE, true)}
<div class="label" style="left:${CORE[0] + 48}px;top:${CORE[1]}px">${escape(typeof xila.title === "string" ? xila.title : xila.title[lang])}</div>
${Object.entries(tileAt)
  .map(([id, at]) => glyph(getProject(id), at))
  .join("\n")}
${organizations.map((experience) => pill(experience, pillAt[experience.id])).join("\n")}
</body></html>`;
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
});
for (const lang of ["en", "fr"]) {
  for (const theme of ["light", "dark"]) {
    // A file page, not setContent: about:blank may not load local fonts
    // and logos.
    const name = `linkedin-banner-${lang}-${theme}`;
    writeFileSync(out + name + ".html", page(lang, theme));
    await tab.goto(pathToFileURL(out + name + ".html").href);
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({ path: out + name + ".png" });
    console.log(`Wrote ${out}${name}.png`);
  }
}
await browser.close();
