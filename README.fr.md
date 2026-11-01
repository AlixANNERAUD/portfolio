# Alix ANNERAUD - Portfolio

**Logiciel, systèmes et sécurité.**

[Portfolio](https://alix.anneraud.fr/fr/) · [Projets](https://alix.anneraud.fr/fr/projects) · [English](./README.md)

Ce site est un portfolio bilingue entièrement généré avec **Astro** : chaque page est rendue en HTML à la compilation, et les quelques contrôles interactifs sont des améliorations progressives. Chaque projet possède sa fiche en Markdown ou MDX dans une collection typée.

## Architecture

- **Astro 7** : génération HTML, routes, pages FR/EN, SEO et sitemap.
- **Composants Astro + TypeScript** : toute l’interface. De petits `<script>` modules ajoutent les filtres des projets, le bouton des expériences plus anciennes, le repli des logos, la démo Xila à la demande et l’animation WebGL facultative ; sans JavaScript, tout le contenu reste visible. Aucun framework client.
- **MDX** : diagrammes et composants Astro intégrés aux études de cas Xila, Infrastructure et Mini Train Store.
- **Styles à portée limitée (scoped) d’Astro** sur les jetons de design de `src/styles/tokens.css` : styles adaptatifs (responsive) de l’interface, sans framework CSS.
- **`src/i18n/ui.ts`** : dictionnaire typé FR/EN de toutes les chaînes de l’interface.
- **GitHub Pages** : hébergement de `dist/`, sans backend.

## Développement local

```sh
npm ci
npm run dev       # serveur de développement Astro
npm run check     # format, types, tests unitaires, validation, build, vérifications statiques, instantané
npm run preview   # sert le dossier dist/ compilé
```

`npm run check` enchaîne `format:check` (Prettier), `check:types` (`astro check`), `test:unit`, `validate:portfolio`, `build`, `verify:static` et la comparaison des pages compilées et du sitemap avec `scripts/reference/dist-snapshot.json`. Le lancer avant chaque commit ; la CI exécute la même commande.

Le test de fumée facultatif dans le navigateur (Playwright) se trouve dans `tools/browser-checks/` : lancer `npm run preview`, puis `npm install` et `TEST_BASE_URL=<URL de prévisualisation> npm test` dans ce dossier.

**Images :** les cartes sociales (`public/images/og-default.png`, `og-default.fr.png`), les favicons (`public/images/favicon.svg`, `public/favicon.ico`), l’icône Apple et le monogramme de l’en-tête (`src/assets/monogram.svg`) sont générés par `scripts/generate-images.mjs`. Lancer `npm run images` après avoir modifié `meta.homeTitle` ou `home.hero.discipline` dans `src/i18n/ui.ts`, un jeton de couleur ou une police, puis committer les fichiers régénérés. Le résultat ne dépend que des paquets de polices figés : il est identique sur toutes les machines.

## Structure

```text
astro.config.mjs          Sortie statique en fichiers .html, MDX, sitemap, polices, plugins Markdown
src/
  pages/
    [...lang]/            Chaque page une seule fois, générée pour / (anglais) et /fr/ (français) :
                          index, projects, experiences, skills, resume, legal-notice, projects/[slug]
    404.astro
    llms.txt.ts           /llms.txt, index Markdown de toutes les pages pour les modèles de langage
    .well-known/          security.txt (contact, renouvelé à chaque build)
  layouts/
    BaseLayout.astro      Structure HTML : en-tête, navigation, pied de page, JSON-LD
    ProjectLayout.astro   Fiche projet : fil d’Ariane, titre, métadonnées, contenu, projets liés et suivant
  components/
    ui/                   Primitives : Hero, SectionHeading, Card, Tags, NextLink, Eyebrow
    home/                 Accueil : introduction, parcours, projets mis en avant
    experience/           ExperienceCard et ExperienceTimeline
    projects/             ProjectCard, ProjectCatalogue (filtrable), Breadcrumb, RelatedProjects
    resume/               ResumeSummary (résumé HTML) et PdfEmbed
    skills/ xila/ mdx/    Sections de pages et composants MDX
    site/                 SiteHead, SiteHeader, SiteFooter, ThemeSwitch (Auto / Clair / Sombre), JsonLd
  content.config.ts       Collection de projets typée
  content/
    projects/{en,fr}/     27 projets, une fiche Markdown / MDX par langue
    legal/{en,fr}.md      Mentions légales et crédits des logos
  data/                   Projets, expériences, compétences, technologies (tags), identité du site, types
  i18n/                   Langues et dictionnaire typé de l’interface (ui.ts)
  lib/                    seo.ts (JSON-LD), plugins Markdown (titre des projets, typographie française),
                          formatage, disposition de l’accueil (home-orbit.ts)
  styles/                 tokens.css (jetons de design), styles de base, prose et animations
public/                   Images (dont les logos auto-hébergés), CNAME, robots.txt
scripts/                  Validation des sources, vérification du HTML compilé, instantané, tests unitaires
tools/browser-checks/     Test de fumée Playwright
```

**Routes :** les pages anglaises sont à la racine, les pages françaises sous `/fr/`. `build.format = "preserve"` produit `dist/<page>.html` ; les URL `/projects/<id>` restent stables. Chaque projet a une fiche dans les deux langues, avec liens canoniques et `hreflang`.

**Données structurées :** chaque page indexable contient un seul `@graph` JSON-LD construit par `src/lib/seo.ts` ; les nœuds Person et WebSite gardent le même `@id` dans les deux langues.

**Typographie française :** les fiches en français sont composées à la compilation par `src/lib/rehype-french-typography.mjs` (espaces insécables, guillemets « », ordinaux). Les chaînes de l’interface et les données ne passent pas par ce plugin : `validate:portfolio` vérifie qu’elles sont déjà correctes.

**Page d’accueil :** le parcours professionnel précède les projets mis en avant. Le schéma WebGL apparaît plus bas, clairement présenté comme l’architecture de Xila, et non comme l’ensemble du parcours. Les cartes d’expérience sont générées statiquement depuis les données partagées.

**Contenu :** pour ajouter un projet, compléter [`projects.ts`](./src/data/projects.ts), puis ajouter une fiche dans **les deux langues** sous `src/content/projects/{en,fr}/`, avec un `title`, une `description` de 120 à 160 caractères et un seul H1. Réserver MDX aux composants nécessaires (`ArchitectureFlow`, `XilaBrowserDemo`). Les tags viennent de `technologies.ts`.

**Interface :** réutiliser les primitives de `src/components/ui/` et les jetons de `src/styles/tokens.css`. Toute chaîne d’interface va dans `src/i18n/ui.ts`, dans les deux langues ; l’interactivité passe par un `<script>` d’amélioration progressive, sans framework client.

**Déploiement :** `.github/workflows/ci.yml` exécute `npm run check`, et `.github/workflows/deploy.yml` publie `dist/` sur GitHub Pages à chaque push sur `main`.

## Services externes

Le site est entièrement statique. La mesure d’audience Umami est chargée depuis `s.anneraud.fr` ; la démo Xila est servie depuis une autre origine et ne se charge qu’après un clic. Les logos sous licence compatible sont auto-hébergés, les autres sont chargés depuis les sites des organismes. Tous sont crédités dans les mentions légales et laissent place aux initiales en cas d’échec.

## Licence

Le code source est publié sous [licence MIT](./License).
