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
