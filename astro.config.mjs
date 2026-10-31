import { defineConfig, fontProviders } from "astro/config";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://alix.anneraud.fr",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "preserve" },
  integrations: [vue(), mdx(), sitemap()],
  // Fontsource serves Newsreader as one variable file per style, so the
  // emitted @font-face declares the file's full 200-800 weight axis. Astro
  // only has fallback metrics for generic families: the metric-adjusted
  // fallback is "Times New Roman" (from `serif`); Georgia stays unadjusted.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Newsreader",
      cssVariable: "--font-display",
      weights: ["400 700"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: ["400 600"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
});
