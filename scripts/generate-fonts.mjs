import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import subsetFont from "subset-font";

/**
 * Web fonts, instanced from Fontsource's variable latin files.
 *
 *   npm run fonts
 *
 * Newsreader's variable files carry a weight axis (200-800) and an optical
 * size axis (6-72). Browsers set the optical size from the font size
 * (`font-optical-sizing: auto`), which is what gives the large headings
 * their high-contrast display cut, so that axis stays. Each file keeps every
 * glyph of the latin subset and only the part of each axis the CSS reaches:
 *
 * - Newsreader upright: weights 400-600; optical sizes 18-72, the font's
 *   default up to the largest, since no Newsreader text is set below 19px.
 * - Newsreader italic: only the hero accent (`Hero.astro`, 400, 41.6-86.4px)
 *   is italic, so weight 400 and optical sizes 24-72.
 * - JetBrains Mono: weights 400-700 (700 for the logo fallback initials).
 *
 * The files are committed under src/assets/fonts/ and declared in
 * astro.config.mjs with the same ranges; widen both if the CSS needs a
 * weight or a size outside them, then run this again.
 */

const require = createRequire(import.meta.url);
const outDir = resolve(import.meta.dirname, "../src/assets/fonts");

const fonts = [
  {
    source:
      "@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2",
    output: "newsreader-latin-normal.woff2",
    axes: { wght: { min: 400, max: 600 }, opsz: { min: 18, max: 72 } },
  },
  {
    source:
      "@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2",
    output: "newsreader-latin-italic.woff2",
    axes: { wght: 400, opsz: { min: 24, max: 72 } },
  },
  {
    source:
      "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
    output: "jetbrains-mono-latin-normal.woff2",
    axes: { wght: { min: 400, max: 700 } },
  },
];

mkdirSync(outDir, { recursive: true });
for (const { source, output, axes } of fonts) {
  const input = readFileSync(require.resolve(source));
  const font = await subsetFont(input, null, {
    targetFormat: "woff2",
    keepAllGlyphs: true,
    // Keep the licence URL (OFL 1.1) next to the copyright notice.
    preserveNameIds: [14],
    variationAxes: axes,
  });
  writeFileSync(resolve(outDir, output), font);
  console.log(`${output}: ${input.length} -> ${font.length} bytes`);
}
