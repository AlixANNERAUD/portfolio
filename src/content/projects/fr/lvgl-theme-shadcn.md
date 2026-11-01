---
title: "lvgl_theme_shadcn : thème LVGL façon shadcn"
description: "Un thème C99 qui habille chaque widget de LVGL 9 dans le style shadcn/ui, avec des palettes claires et sombres changeables à l’exécution et des liaisons Rust."
---

# lvgl_theme_shadcn : le style shadcn/ui sur LVGL 9

## Présentation

`lvgl_theme_shadcn` donne à une interface LVGL l’apparence de shadcn/ui en un seul appel de fonction. Il habille chaque widget de base, des boutons et curseurs jusqu’aux tableaux, calendriers et claviers, dans ses états normal, appuyé, coché, avec le focus et désactivé : les applications continuent d’écrire du code LVGL ordinaire au lieu de redéfinir elles-mêmes le style de chaque widget.

C’est une bibliothèque C99 pour LVGL 9.6 ou plus récent, sans autre dépendance, accompagnée de liaisons Rust `no_std` publiées sur crates.io. Le dépôt fournit les fichiers d’intégration pour CMake, ESP-IDF, Zephyr, PlatformIO et Arduino.

## Choix techniques

- **Des palettes changeables à l’exécution.** Les 9 couleurs de base de shadcn/ui se combinent avec 18 couleurs d’accent, en clair et en sombre. Changer de palette met à jour les widgets existants sur place, sans reconstruire l’écran. Un script importe un thème créé avec l’éditeur de thèmes de shadcn/ui, et une palette complète peut être dérivée d’une seule couleur de marque.
- **Un rendu peu coûteux.** Ni ombres, ni flou, ni dégradés : des aplats et des bordures de 1 dp, qui restent rapides sur des microcontrôleurs aux tampons de dessin réduits et aux écrans RGB565.
- **Pensé pour le tactile.** Les contrôles mesurent 40 dp de haut avec des zones tactiles de 48 dp, et un contour de focus visible accompagne la navigation au clavier ou à l’encodeur rotatif. Une option compacte resserre l’ensemble pour les petits écrans.
- **Les rôles de composants de shadcn.** Variantes et tailles de boutons, rôles de texte de `h1` à `muted`, badges, alertes, cartes et squelettes de chargement s’appliquent en un appel sur un objet LVGL ordinaire. Les squelettes cessent de pulser quand la réduction des animations est demandée.
- **Des tests par captures d’écran.** Les images de la galerie du dépôt sont les références d’une suite de tests par captures, rendues en 480 × 320 à partir des scènes d’exemple.

## Explorer le projet

- [Code source et galerie](https://github.com/AlixANNERAUD/lvgl_theme_shadcn)
- [Liaisons Rust sur crates.io](https://crates.io/crates/lvgl_theme_shadcn)
