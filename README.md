# Alix ANNERAUD - Portfolio

**From kernel to browser.** Software engineering · Rust systems · Embedded software · Security

[Live portfolio](https://alix.anneraud.fr/) · [Projects](https://alix.anneraud.fr/projects) · [Français](./README.fr.md)

A bilingual, statically generated engineering portfolio built entirely with **Astro**: every page is server-rendered HTML, and the few interactive controls are progressive enhancements. Project case studies are regular Markdown or MDX entries in a typed content collection.

## Stack

- **Astro 7** generates static HTML, page layouts, routes and localized metadata.
- **Astro components + TypeScript** render the whole UI. Small module `<script>`s add the project filters, the earlier-roles toggle, the logo fallback, the opt-in Xila browser demo and the optional WebGL architecture visualization; without JavaScript, all content stays visible. There is no client framework.
- **MDX** embeds Astro components (architecture diagrams, the Xila demo) in the three detailed engineering case studies.
- **Scoped Astro CSS** on top of shared design tokens in `src/styles/` provides the responsive editorial UI.
- **`src/i18n/ui.ts`** is the typed EN/FR dictionary for every UI string.
- **GitHub Pages** serves `dist/`; no backend or runtime server is required.

## Work locally

```sh
npm ci
npm run dev              # Astro development server
npm run validate:portfolio
npm run build            # Static output: dist/
npm run verify:static    # Route / SEO / content smoke tests
npm run preview
```

Run `npm run check` (format, types, validation, build and static verification) before merging.

## Project structure

```text
astro.config.mjs          Static site, .html routes, MDX/sitemap integrations, fonts
src/
  components/
    ui/                   Editorial primitives: Hero, SectionHeading, Card, Tags, NextLink, Eyebrow
    home/                 Homepage hero, experience overview, featured projects
    experience/           ExperienceCard and ExperienceTimeline
    projects/             ProjectCard and the filterable ProjectCatalogue
    skills/ xila/ mdx/ resume/ site/   Page sections, MDX components, site shell
  content.config.ts       Typed Astro content collection
  content/
    projects/en/          26 English Markdown / MDX case studies
    projects/fr/          26 French Markdown / MDX case studies
    legal/                Bilingual legal notice + third-party logo credits
  data/
    projects.ts           Project metadata and derived rankings
    experiences.ts        Work and education timeline
    skills.ts             Evidence-backed skills and languages
  i18n/                   Locales and the typed UI dictionary (ui.ts)
  lib/                    Formatting (periods, plurals) and the Xila topology
  layouts/BaseLayout.astro  HTML shell, navigation, theme, SEO and language alternates
  pages/                 English routes at /, French routes under /fr/
  styles/                Design tokens, base styles, prose and motion
public/                  Images, CNAME and robots.txt
scripts/                 Content and generated-HTML validation
```

**Routes:** English pages appear at the root; French pages under `/fr/`. Existing `/projects/<id>` URLs and the generated `/projects/<id>.html` files remain stable with `build.format = "preserve"`. Every project has a dedicated page in both languages. Removed archive routes stay removed.

**Homepage:** lead with a professional overview (Memo Bank, Linkt, Amazon, NYU), then the selected Xila / Infrastructure / Mini Train Store projects; keep the Xila architecture diagram as an explicitly labelled technical deep dive below the portfolio cards. This section is statically rendered: a static SVG is always present, and a module script swaps in the WebGL animation once it is in view, when WebGL2 is available and motion is allowed.

**Content editing:** Add metadata to [`projects.ts`](./src/data/projects.ts) and one file per locale under `src/content/projects/{en,fr}/`. Use `.mdx` only when a component is needed (`ArchitectureFlow`, `XilaBrowserDemo`); both are Astro components, and the demo only loads its iframe after a click. Links and project ranking remain data-driven.

**UI editing:** Reuse the primitives in `src/components/ui/` (`Hero`, `SectionHeading`, `Card`, `Tags`, `NextLink`, `Eyebrow`) rather than duplicating their styles. Add every UI string to `src/i18n/ui.ts` in both languages. Interactivity is a progressive-enhancement `<script>` inside the component; do not add a client framework.

**Deployment:** `.github/workflows/ci.yml` checks content/build/SEO, and `.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on pushes to `main`.

## External services

The main site is fully static. Umami analytics is loaded from `s.anneraud.fr`; the Xila browser demo is on a separate origin and only mounted after a click. Third-party logos remain attributed in the legal notices and may fall back to readable initials.
