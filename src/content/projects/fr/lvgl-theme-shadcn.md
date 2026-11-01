---
title: "lvgl_theme_shadcn"
description: "Un thème inspiré de shadcn/ui pour LVGL 9 : widgets, palettes claires/sombres et personnalisation sur microcontrôleurs."
---

# lvgl_theme_shadcn

> Un thème inspiré de shadcn/ui pour LVGL 9 : widgets, palettes claires/sombres et personnalisation sur microcontrôleurs.

## Présentation

Bibliothèque C99 compatible avec LVGL 9 proposant une identité visuelle inspirée de shadcn/ui pour les interfaces embarquées. Elle définit des palettes claires et sombres, des styles de composants et des variantes adaptées aux petits écrans et aux contrôles tactiles. Des bindings Rust `no_std` et des exemples de rendu accompagnent la bibliothèque. [Code et galerie](https://github.com/AlixANNERAUD/lvgl_theme_shadcn).

## Démarche technique

Le thème abstrait une identité visuelle cohérente au-dessus des widgets LVGL 9, au lieu de redéfinir chaque état de composant dans chaque application. Le dépôt contient des captures de rendu et une bibliothèque C99 utilisable depuis des projets embarqués, y compris Rust.

## Portée et limites

Bibliothèque conçue pour être réutilisée indépendamment d'une application. Les API et exemples à jour figurent dans le dépôt source ; les contraintes d'environnement et les versions supportées doivent y être vérifiées.
