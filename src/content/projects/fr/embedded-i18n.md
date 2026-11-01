---
title: "embedded-i18n : traduction compilée en Rust"
description: "Une bibliothèque de traduction pour micrologiciel Rust no_std : les textes sont compilés en mémoire flash, et une traduction manquante bloque la compilation."
---

# embedded-i18n : des traductions résolues à la compilation

## Présentation

`embedded-i18n` traduit les chaînes d’un micrologiciel Rust au moment de la compilation. Les traductions, issues de fichiers JSON, YAML, TOML, gettext PO et MO ou Fluent, deviennent de simples littéraux `&'static str` stockés en mémoire flash. Il n’y a ni analyseur à l’exécution, ni allocateur, ni système de fichiers, ni tas, et le micrologiciel ne contient que les chaînes qu’il utilise, dans la langue pour laquelle il est compilé. La crate est publiée sur crates.io.

## Choix techniques

- **Des erreurs de compilation plutôt qu’un écran vide.** Clés manquantes, formes plurielles absentes, fichiers de langue invalides et paramètres de format qui ne correspondent pas aux arguments sont signalés à l’endroit de l’appel. Un mode strict optionnel interdit de se rabattre sur une autre langue.
- **Les formats que les traducteurs connaissent déjà.** Tous les formats de fichiers de langue sont lus par les macros procédurales : en prendre un en charge n’ajoute ni code ni dépendance au micrologiciel.
- **Une prise en charge linguistique complète.** Règles de pluriel CLDR pour 40 langues, `Plural-Forms` de gettext, contexte des messages, variantes de sélection (genre, états, énumérations), chaînes de repli comme `fr-CA` → `fr` → `en`, isolation des textes écrits de droite à gauche et dates localisées sans `libc`.
- **Un formatage sans allocation.** Les messages traduits s’écrivent vers toute cible `core::fmt::Write`, comme un pilote d’écran, avec des paramètres vérifiés à la compilation dans chaque langue.
- **Un changement de langue à l’exécution si besoin.** Plusieurs langues peuvent être intégrées et choisies grâce à une seule variable atomique, toujours sans allocation.

L’ensemble des langues doit être connu à la compilation. Pour une application qui télécharge des paquets de langue, une bibliothèque qui résout les traductions à l’exécution, comme Fluent, reste plus adaptée.

## Explorer le projet

- [Code source et guide](https://github.com/AlixANNERAUD/embedded_i18n)
- [Documentation de l’API sur docs.rs](https://docs.rs/embedded-i18n)
