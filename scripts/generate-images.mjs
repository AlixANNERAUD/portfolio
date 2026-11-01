import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import opentype from "opentype.js";
import { site } from "../src/data/site.ts";
import { ui } from "../src/i18n/ui.ts";

/**
 * Social card and icons, rendered from SVG templates with the site fonts.
 *
 *   npm run images
 *
 * Text is laid out with opentype.js (kerning included) and drawn as paths,
 * so the output depends on the pinned font files only, never on the fonts
 * installed on the machine; resvg then rasterizes the SVG. The SVGs and PNGs
 * are committed under public/images/: run this again after changing a
 * tagline in src/i18n/ui.ts, a color token or a font.
 */

const require = createRequire(import.meta.url);
function font(file) {
  const bytes = readFileSync(require.resolve("@fontsource/" + file));
  return opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
}
const fonts = {
  display: font("newsreader/files/newsreader-latin-500-normal.woff"),
  displayItalic: font("newsreader/files/newsreader-latin-400-italic.woff"),
  monogram: font("newsreader/files/newsreader-latin-700-normal.woff"),
  mono: font("jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff"),
};

/** sRGB equivalents of the light-theme tokens in src/styles/tokens.css. */
const color = {
  bg: "#fdfdff", // --color-bg
  surface: "#f5f7fb", // --color-surface
  text: "#1e2f41", // --color-text
  muted: "#4d5969", // --color-text-muted
  subtle: "#626975", // --color-text-subtle
  border: "#dbdee5", // --color-border
  accent: "#334fb8", // --color-accent
  accentDark: "#a1b1ff", // --color-accent, dark theme
  bgDark: "#1a1a1e", // --color-bg, dark theme
};

/** Tracking in em, as in tokens.css (--tracking-display, --tracking-overline). */
const tracking = { display: -0.035, overline: 0.14 };

/**
 * One line of text as an SVG path. `x` is the left edge, or the right edge
 * with `anchor: "end"`; `y` is the baseline. The last glyph carries no
 * tracking, so right-aligned text ends exactly at `x`.
 */
function text(
  value,
  { font, size, x, y, fill, letterSpacing = 0, anchor = "start" },
) {
  const options = { kerning: true, letterSpacing };
  const width = measure(value, font, size, letterSpacing);
  const left = anchor === "end" ? x - width : x;
  const path = font.getPath(value, left, y, size, options);
  return `<path fill="${fill}" d="${pathData(path)}"/>`;
}

/**
 * SVG path data from opentype.js commands. Path#toPathData is not used: its
 * number formatting emits "NaN" for some coordinates in opentype.js 2.0.0.
 */
function pathData(path) {
  const n = (value) => String(Math.round(value * 100) / 100);
  return path.commands
    .map((c) => {
      if (c.type === "Z") return "Z";
      if (c.type === "Q") return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      if (c.type === "C") {
        return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      }
      return `${c.type}${n(c.x)} ${n(c.y)}`;
    })
    .join("");
}

function measure(value, font, size, letterSpacing = 0) {
  const end = font.forEachGlyph(
    value,
    0,
    0,
    size,
    {
      kerning: true,
      letterSpacing,
    },
    () => {},
  );
  return end - letterSpacing * size;
}

/** Largest size up to `max` at which `value` fits in `width`. */
function fit(value, font, max, width, letterSpacing = 0) {
  return Math.min(
    max,
    (max * width) / measure(value, font, max, letterSpacing),
  );
}

/** Overline: uppercase JetBrains Mono, widely tracked. */
const overline = (value, options) =>
  text(value.toLocaleUpperCase(options.lang), {
    font: fonts.mono,
    size: 20,
    letterSpacing: tracking.overline,
    ...options,
  });

/** Monogram "A" centered in a square of side `size` at the origin. */
function monogram(size, fill, scale = 0.72) {
  const glyph = fonts.monogram.charToGlyph("A");
  const box = glyph.getBoundingBox();
  const em = fonts.monogram.unitsPerEm;
  const fontSize = (size * scale * em) / (box.y2 - box.y1);
  const k = fontSize / em;
  const x = (size - (box.x2 - box.x1) * k) / 2 - box.x1 * k;
  // Font units point up: the glyph top sits at baseline - y2 * k.
  const baseline = (size - (box.y2 - box.y1) * k) / 2 + box.y2 * k;
  const path = glyph.getPath(x, baseline, fontSize);
  return `<path fill="${fill}" d="${pathData(path)}"/>`;
}

const W = 1200;
const H = 630;
const M = 80;

function socialCard(lang) {
  const t = ui[lang];
  const [name, tagline] = t["meta.homeTitle"].split(" | ");
  if (name !== site.name || !tagline) {
    throw new Error(`Unexpected meta.homeTitle for ${lang}`);
  }
  const width = W - 2 * M;
  const nameSize = fit(name, fonts.display, 132, width, tracking.display);
  const taglineSize = fit(tagline, fonts.displayItalic, 64, width, -0.01);
  const tile = 56;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${color.bg}"/>
  <rect width="${W}" height="8" fill="${color.accent}"/>
  <g transform="translate(${W - M - tile} ${M + 13 - tile / 2})">
    <rect width="${tile}" height="${tile}" rx="12" fill="${color.accent}"/>
    ${monogram(tile, color.bg)}
  </g>
  <rect x="${M}" y="${M + 12}" width="36" height="2" fill="${color.accent}"/>
  ${overline(t["home.hero.discipline"], { lang, x: M + 56, y: M + 20, fill: color.muted })}
  ${text(name, { font: fonts.display, size: nameSize, x: M - 4, y: 305, fill: color.text, letterSpacing: tracking.display })}
  ${text(tagline, { font: fonts.displayItalic, size: taglineSize, x: M - 2, y: 305 + taglineSize * 1.45, fill: color.accent, letterSpacing: -0.01 })}
  <rect x="${M}" y="${H - M - 50}" width="${width}" height="1" fill="${color.border}"/>
  ${overline(new URL(site.url).host, { lang, x: M, y: H - M, fill: color.text })}
  ${overline(t["home.hero.job"], { lang, x: W - M, y: H - M, fill: color.subtle, anchor: "end" })}
</svg>
`;
}

/**
 * Favicon: brand-blue tile with a light "A"; on a dark browser theme the
 * tile takes the dark-theme accent and the letter the dark background.
 */
function favicon() {
  const size = 64;
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .tile { fill: ${color.accent}; }
    .letter { fill: ${color.bg}; }
    @media (prefers-color-scheme: dark) {
      .tile { fill: ${color.accentDark}; }
      .letter { fill: ${color.bgDark}; }
    }
  </style>
  <rect class="tile" width="${size}" height="${size}" rx="14"/>
  ${monogram(size, "currentColor").replace('fill="currentColor"', 'class="letter"')}
</svg>
`;
}

/** Apple touch icon: opaque and square, iOS applies its own mask. */
function touchIcon() {
  const size = 180;
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${color.accent}"/>
  ${monogram(size, color.bg, 0.58)}
</svg>
`;
}

const out = (file) => resolve("public/images", file);
const png = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();

writeFileSync(out("og-default.png"), png(socialCard("en"), W));
writeFileSync(out("og-default.fr.png"), png(socialCard("fr"), W));
writeFileSync(out("favicon.svg"), favicon());
writeFileSync(out("apple-touch-icon.png"), png(touchIcon(), 180));
console.log("Wrote the social cards and icons in public/images/.");
