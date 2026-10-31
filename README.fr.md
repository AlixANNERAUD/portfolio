# Alix ANNERAUD - Portfolio

**Du noyau au navigateur.** Ingénierie logicielle · Systèmes Rust · Embarqué · Sécurité

[Portfolio](https://alix.anneraud.fr/fr/) · [Projets](https://alix.anneraud.fr/fr/projects) · [English](./README.md)

Ce site est un portfolio bilingue entièrement généré avec **Astro** : chaque page est rendue en HTML côté serveur, et les quelques contrôles interactifs sont des améliorations progressives. Chaque projet possède sa fiche en Markdown ou MDX.

## Architecture

- **Astro 7** : génération HTML, routes, pages FR/EN, SEO et sitemap.
- **Composants Astro + TypeScript** : toute l’interface. De petits `<script>` modules ajoutent les filtres des projets, le bouton des expériences plus anciennes, le repli des logos, la démo Xila à la demande et l’animation WebGL facultative ; sans JavaScript, tout le contenu reste visible. Aucun framework client.
- **MDX** : diagrammes et composants Astro intégrés aux études de cas Xila, Infrastructure et Mini Train Store.
- **CSS scoped d’Astro** et jetons de design partagés dans `src/styles/` : styles responsive de l’interface.
- **`src/i18n/ui.ts`** : dictionnaire typé FR/EN de toutes les chaînes de l’interface.
- **GitHub Pages** : hébergement de `dist/`, sans backend.

## Développement local

```sh
npm ci
npm run dev
npm run validate:portfolio
npm run build
npm run verify:static
npm run preview
```

Lancer `npm run check` (format, types, validation, build et vérification statique) avant de fusionner.

## Structure

```text
astro.config.mjs              Configuration d’Astro (sortie HTML, MDX, sitemap, polices)
src/
  components/
    ui/                       Primitives : Hero, SectionHeading, Card, Tags, NextLink, Eyebrow
    home/                     Accueil : introduction, parcours, projets mis en avant
    experience/               ExperienceCard et ExperienceTimeline
    projects/                 ProjectCard et le catalogue filtrable ProjectCatalogue
    skills/ xila/ mdx/ resume/ site/   Sections, composants MDX, structure du site
  content.config.ts           Collection de projets typée
  content/projects/en/        26 fiches en anglais
  content/projects/fr/        26 fiches en français
  content/legal/              Mentions légales et crédits des logos
  data/                       Projets, expériences et compétences bilingues
  i18n/                       Langues et dictionnaire typé de l’interface (ui.ts)
  lib/                        Formatage (périodes, pluriels) et topologie Xila
  layouts/BaseLayout.astro    Navigation, couleurs, langues, SEO
  pages/                      Routes anglaises / et françaises /fr/
  styles/                     Jetons de design, styles de base, prose et animations
public/                       Images, CNAME, robots.txt
scripts/                      Vérification des données et du HTML généré
```

**Page d’accueil :** le parcours professionnel (Memo Bank, Linkt, Amazon et NYU) précède les projets sélectionnés. Le schéma WebGL apparaît plus bas, clairement identifié comme une présentation de l’architecture de Xila, et non de l’ensemble du parcours. Les cartes d’expérience sont générées statiquement depuis les données partagées.

Pour ajouter un projet, modifier les données dans [`projects.ts`](./src/data/projects.ts), puis ajouter une fiche dans **les deux langues**. Réserver MDX aux composants nécessaires ; pour les cartes et en-têtes, réutiliser les primitives de `src/components/ui/` (`Hero`, `SectionHeading`, `Card`, `Tags`, `NextLink`, `Eyebrow`). Toute chaîne d’interface va dans `src/i18n/ui.ts`, dans les deux langues ; l’interactivité passe par un `<script>` d’amélioration progressive, sans framework client.

Les URL existantes (dont `/fr/projects/xila` et les fichiers `.html`) restent conservées. Les anciennes archives de projets ne sont pas recréées.

La CI GitHub Actions vérifie les 52 fiches, les pages FR/EN, les composants SSR et les métadonnées SEO. Le déploiement sur GitHub Pages se fait depuis `dist/` après fusion sur `main`.
