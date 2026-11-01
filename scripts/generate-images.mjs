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

/**
 * Tracking in em. Display matches --tracking-display in tokens.css; the
 * overline is tighter than --tracking-overline, since the card is mostly
 * seen as a thumbnail about a third of its size, where wide tracking
 * breaks the words apart.
 */
const tracking = { display: -0.035, overline: 0.08 };

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

/**
 * Overline: uppercase JetBrains Mono, 30px by default (10px in a 400px
 * wide chat preview), shrunk to fit `width` when given.
 */
function overline(value, { lang, width, size = 30, ...options }) {
  const label = value.toLocaleUpperCase(lang);
  const fitted = width
    ? fit(label, fonts.mono, size, width, tracking.overline)
    : size;
  return text(label, {
    font: fonts.mono,
    size: fitted,
    letterSpacing: tracking.overline,
    ...options,
  });
}

/**
 * Monogram "A" centered in a square of side `size` at the origin. `scale`
 * is the glyph height over `size`; `attributes` go on the path (a fill, or
 * a class and a stroke that thickens the strokes at small sizes).
 */
function monogramPath(size, scale = 0.72) {
  const glyph = fonts.monogram.charToGlyph("A");
  const box = glyph.getBoundingBox();
  const em = fonts.monogram.unitsPerEm;
  const fontSize = (size * scale * em) / (box.y2 - box.y1);
  const k = fontSize / em;
  const x = (size - (box.x2 - box.x1) * k) / 2 - box.x1 * k;
  // Font units point up: the glyph top sits at baseline - y2 * k.
  const baseline = (size - (box.y2 - box.y1) * k) / 2 + box.y2 * k;
  return pathData(glyph.getPath(x, baseline, fontSize));
}

const monogram = (size, fill, scale) =>
  `<path fill="${fill}" d="${monogramPath(size, scale)}"/>`;

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
  const top = M + 10; // overline baseline, level with the tile's center
  const rule = 470;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${color.bg}"/>
  <rect width="${W}" height="8" fill="${color.accent}"/>
  <g transform="translate(${W - M - tile} ${top - 11 - tile / 2})">
    <rect width="${tile}" height="${tile}" rx="12" fill="${color.accent}"/>
    ${monogram(tile, color.bg)}
  </g>
  ${overline(t["meta.discipline"], { lang, x: M, y: top, width: width - tile - 40, fill: color.muted })}
  ${text(name, { font: fonts.display, size: nameSize, x: M - 4, y: 320, fill: color.text, letterSpacing: tracking.display })}
  ${text(tagline, { font: fonts.displayItalic, size: taglineSize, x: M - 2, y: 320 + taglineSize * 1.45, fill: color.accent, letterSpacing: -0.01 })}
  <rect x="${M}" y="${rule}" width="${width}" height="1" fill="${color.border}"/>
  <rect x="${M}" y="${rule - 1}" width="64" height="3" fill="${color.accent}"/>
  ${overline(new URL(site.url).host, { lang, x: M, y: H - M + 4, size: 32, fill: color.text })}
</svg>
`;
}

/**
 * Favicon tile. In browser tabs it is drawn at 16px, where the Newsreader
 * hairlines vanish: the glyph is smaller than on the card, leaving a pixel
 * of tile around it, and a stroke in the letter color thickens its stems.
 * With `dark`, the SVG switches to the dark-theme accent and background on
 * a dark browser theme (raster icons cannot, they keep the light colors).
 */
function favicon({ dark = false } = {}) {
  const size = 64;
  const letter = monogramPath(size, 0.62);
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .tile { fill: ${color.accent}; }
    .letter { fill: ${color.bg}; stroke: ${color.bg}; }${
      dark
        ? `
    @media (prefers-color-scheme: dark) {
      .tile { fill: ${color.accentDark}; }
      .letter { fill: ${color.bgDark}; stroke: ${color.bgDark}; }
    }`
        : ""
    }
  </style>
  <rect class="tile" width="${size}" height="${size}" rx="14"/>
  <path class="letter" stroke-width="2.5" stroke-linejoin="round" d="${letter}"/>
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

/**
 * The bare letter for the site header, which draws the tile in CSS with
 * the theme tokens: the glyph fills the box and takes the current color.
 */
function headerMonogram() {
  const size = 64;
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="${monogramPath(size, 0.62)}"/>
</svg>
`;
}

const png = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();

/**
 * /favicon.ico for clients without SVG icons (crawlers, link previews,
 * older browsers), which request it at the root by default. An ICO file is
 * a 6-byte header, a 16-byte entry per image and the images themselves,
 * stored as PNG (supported since Windows Vista).
 */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size, entry); // width
    header.writeUInt8(size, entry + 1); // height
    header.writeUInt16LE(1, entry + 4); // color planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

const out = (file) => resolve("public", file);

writeFileSync(out("images/og-default.png"), png(socialCard("en"), W));
writeFileSync(out("images/og-default.fr.png"), png(socialCard("fr"), W));
writeFileSync(out("images/favicon.svg"), favicon({ dark: true }));
writeFileSync(
  out("favicon.ico"),
  ico([16, 32, 48].map((size) => ({ size, data: png(favicon(), size) }))),
);
writeFileSync(out("images/apple-touch-icon.png"), png(touchIcon(), 180));
writeFileSync(resolve("src/assets/monogram.svg"), headerMonogram());
console.log("Wrote the social cards and icons in public/ and src/assets/.");
