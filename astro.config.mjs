import { defineConfig, fontProviders } from "astro/config";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

const site = "https://alix.anneraud.fr";
// The French home page is canonically `/fr/` (its indexed URL), but the
// sitemap integration emits `/fr`; align the location and its alternates.
const frenchHome = (url) => (url === `${site}/fr` ? `${site}/fr/` : url);
// Only the root 404 page, never a page whose slug merely contains "404".
const isNotFoundPage = (url) =>
  /^\/404(\.html)?\/?$/.test(new URL(url).pathname);

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "ignore",
  build: { format: "preserve", inlineStylesheets: "auto" },
  // English is served unprefixed (`/`), French under `/fr/`; pages live once
  // in src/pages/[...lang]/ and get their locale from getStaticPaths props.
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    vue(),
    mdx(),
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en", fr: "fr" } },
      filter: (page) => !isNotFoundPage(page),
      // Mirror the page <head>: en and fr alternates plus x-default (English).
      serialize: (item) => {
        const links = item.links?.map((link) => ({
          ...link,
          url: frenchHome(link.url),
        }));
        const english = links?.find((link) => link.lang === "en");
        return {
          ...item,
          url: frenchHome(item.url),
          links: english
            ? [...links, { lang: "x-default", url: english.url }]
            : links,
        };
      },
    }),
  ],
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
