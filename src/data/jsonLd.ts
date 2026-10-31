import { site } from "./site.ts";

/** Schema.org Person describing the site owner, emitted on the home pages. */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: `${site.url}/`,
  image: `${site.url}${site.image}`,
  sameAs: [site.social.github, site.social.linkedin],
  knowsAbout: [
    "Rust",
    "WebAssembly",
    "Embedded software",
    "Systems programming",
    "Security",
  ],
};
