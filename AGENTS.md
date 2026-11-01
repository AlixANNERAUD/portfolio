# Repository instructions - alix.anneraud.fr

This is the **single source of truth** for coding agents. `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md` remain Git symlinks to this file.

## Architecture

- This is a **statically generated Astro 7 portfolio** (not VitePress). Do not introduce a server or another framework without an explicit request.
- English routes are at `/`, French routes under `/fr/`. Route compatibility and canonical/alternate links matter: `build.format: "preserve"` writes `dist/x.html` files (never `x/index.html`), and internal links have no trailing slash except `/` and `/fr/`.
- `src/pages/[...lang]/`: every page exists once and is generated per locale (`lang` is `undefined` for English, `fr` for French) through `localeStaticPaths()` in `src/i18n/locales.ts`: `index`, `projects`, `experiences`, `skills`, `resume`, `legal-notice`, and `projects/[slug].astro`, which renders the 27 projects of the typed collection in `src/content.config.ts`. `src/pages/404.astro` is the only unlocalized page.
- `src/layouts/BaseLayout.astro`: HTML shell, imports the global styles, and renders `site/SiteHead` (meta, canonical, `hreflang`, Open Graph, analytics and the page JSON-LD graph, including the BreadcrumbList built from `trail`), `SiteHeader` (accessible navigation, Auto / Light / Dark theme switch, locale switch) and `SiteFooter`. `src/layouts/ProjectLayout.astro`: project pages (breadcrumb, H1, meta line from the project data, Markdown body, related projects, next project).
- `src/content/projects/{en,fr}/`: one `.md` or `.mdx` page per project in each locale. MDX is reserved for components such as architecture diagrams and the Xila demo. Do not restore the removed archive routes. `src/content/legal/{en,fr}.md`: the legal notice, including logo credits.
- Markdown plugins (`astro.config.mjs`): `src/lib/project-title-plugin.mjs` lifts each project's H1 into `ProjectLayout`'s header; `src/lib/rehype-french-typography.mjs` typesets French files (narrow no-break space before `; ! ?`, no-break space before `:` and inside « », ordinals). Plain strings (UI dictionary, data, frontmatter) do not go through it and must already be correct.
- `src/data/`: `projects.ts` (bilingual metadata and derived rankings; `projects` is `as const` so `ProjectId` is a literal union, use `getProject(id)`), `experiences.ts`, `skills.ts`, `technologies.ts` (canonical project tags), `site.ts` (public identity, profiles, endpoints) and `types.ts` (`Localized`, `Label`, periods).
- `src/i18n/ui.ts`: the typed UI dictionary; every UI string lives there. `src/lib/format.ts` and `plural.ts` format periods and counts.
- `src/lib/seo.ts`: schema.org JSON-LD builders. Every indexable page emits exactly one `@graph`; Person, WebSite and the home ProfilePage keep the same `@id` in both locales and other nodes reference them by `@id`. Rendered by `site/JsonLd.astro`.
- `src/components/` (all Astro, no client framework): `ui/{Hero,SectionHeading,Card,Tags,NextLink,Eyebrow}.astro` editorial primitives; `home/` (`HomeHero`, `HomeExperience`, `FeaturedProjects`); `experience/ExperienceCard.astro` and `ExperienceTimeline.astro`; `projects/` (`ProjectCard`, `ProjectCatalogue`, `Breadcrumb`, `RelatedProjects`); `resume/` (`ResumeSummary`, the HTML summary built from the same data, and `PdfEmbed`); `skills/`, `xila/`, `mdx/ArchitectureFlow.astro`, `site/` (head, header, footer, `ThemeSwitch`, JSON-LD).
- **Experience timeline**: recent cards are visible by default; older cards are grouped behind an accessible section-level toggle. Mark earlier roles with `earlier: true` in `src/data/experiences.ts` (including Corporate Relations Assistant). Do not truncate individual card descriptions to implement “show more”; `ExperienceCard.astro` owns the complete reusable card layout, and `ExperienceTimeline.astro` the rail and toggle.
- **Experience logos**: logos whose licence allows it (verified on the Wikimedia Commons file page) are self-hosted under `public/images/logos/`; the others stay remote. Every logo is credited in the legal notice, and the initials monogram under each image shows if it fails to load.
- **Homepage intro**: `HomeHero.astro` is a full-viewport typographic introduction, with CSS-only staggered motion and a career scroll cue; do not restore the pixel portrait, introduce hero-only client JS, or ignore `prefers-reduced-motion`.
- **Homepage hierarchy**: professional overview before diverse featured projects, then the Xila-only technical deep dive. Keep all four professional roles data-driven from `experiences.ts`, and never suggest the Xila architecture visualization maps the user’s entire experience.
- `src/styles/`: `tokens.css` is the single source for type, space, layout, radius, color (`light-dark()`) and motion tokens; `base.css` (base styles and shared utilities such as `.visually-hidden`), `prose.css` and `motion.css`. Components use scoped Astro CSS on top of the tokens.
- `public/`: images (including self-hosted logos), robots.txt and GitHub Pages CNAME.
- `scripts/`: `validate-portfolio.mjs` checks the sources (FR/EN pages for every project, one H1, descriptions of 120 to 160 characters, unique titles, French typography of plain strings, no Vue); `check-static-seo.mjs` (`verify:static`) checks the built HTML (canonical, `hreflang`, JSON-LD, typography); `snapshot-dist.mjs` compares the built pages and sitemap with `scripts/reference/dist-snapshot.json`; `*.test.mjs` are unit tests. `tools/browser-checks/` holds the Playwright smoke test. CI and deploy live under `.github/workflows/`.

## Code and content guidance

1. Maintain FR/EN parity, truthful public claims, correct metadata, canonical URLs and `hreflang`.
2. Every project added to `src/data/projects.ts` requires one entry under **both** `src/content/projects/en/` and `src/content/projects/fr/` with `title`, `description`, and exactly one H1.
3. Prefer plain Astro / Markdown for static content. Interactivity uses progressive-enhancement module `<script>`s only, with no client framework and no `client:*` hydration (validation fails on any `.vue` file or Vue dependency). Content must be complete without JavaScript.
4. Reuse the Astro editorial primitives in `src/components/ui/`; put UI strings in `src/i18n/ui.ts`; preserve keyboard focus, reduced motion, mobile layout, theme tokens and SSR-visible content.
5. Never include secrets, proprietary employer source, personal records or fabricated performance/usage metrics in public pages.
6. Preserve logo attribution in the legal notices; self-host a third-party logo only when its licence clearly allows it, and credit it. Keep the fallback initials if a logo fails to load.
7. Do not resurrect a `docs/` folder or old VitePress `.vitepress/` files.
8. Treat the current source and CI as authoritative; avoid overwriting work in other PRs. Open PRs rather than pushing directly to `main` unless explicitly asked.

## Build and verification

```sh
npm ci
npm run check   # format, astro check, unit tests, validate:portfolio, build, verify:static, snapshot compare
```

`npm run check` must pass before every commit. `npm run dev` starts Astro locally; `npm run preview` previews the static `dist/` output. Both English and French pages must be server-rendered correctly. To run the browser smoke test, serve `dist/` with `npm run preview`, then run `TEST_BASE_URL=<preview URL> npm test` in `tools/browser-checks/`; the browser audit workflow may also be launched when visual or hydration regressions are suspected.
