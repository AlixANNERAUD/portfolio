---
title: "getargs-derive : ligne de commande no_std"
description: "Des macros de dérivation Rust qui transforment une structure en analyseur d’arguments façon Clap pour cibles no_std, sans allocation et avec aide précalculée."
---

# getargs-derive : l’analyse d’arguments façon Clap en no_std

## Présentation

`getargs-derive` décrit une interface en ligne de commande sous la forme d’une structure Rust et génère l’analyseur correspondant, dans le style de l’API de dérivation de Clap. Clap exige `std` ; cette crate cible `no_std`, si bien que le même code fonctionne sur un microcontrôleur qui lit ses arguments sur une console série, dans un noyau ou dans un exécutable classique. L’analyseur généré repose sur la crate `getargs`, et les deux sont publiées sur crates.io.

## Choix techniques

- **Aucune allocation par défaut.** Les valeurs analysées et les erreurs empruntent les arguments, et les valeurs répétées tiennent dans des collections de capacité fixe. Un stockage `heapless` ou `Vec` est disponible en option.
- **Une aide calculée à la compilation.** `--help`, `--version` et l’aide de chaque sous-commande sont des constantes `&'static str` produites par la macro : aucun code de mise en forme de l’aide ne se retrouve dans l’exécutable.
- **Des attributs familiers, vérifiés par le compilateur.** Les commentaires de documentation deviennent le texte d’aide, et sous-commandes, énumérations de valeurs, valeurs par défaut, alias, relations et groupes d’arguments reprennent les noms d’attributs de Clap. Les attributs de Clap non pris en charge sont refusés à la compilation au lieu d’être ignorés.
- **Le programme garde la main.** L’analyseur n’affiche rien et ne quitte jamais de lui-même : il renvoie la structure ou une erreur, avec des messages à la Clap et des suggestions pour les options mal orthographiées.
- **Des compléments avec `std`.** Des scripts d’autocomplétion pour bash, zsh et fish ainsi qu’une page de manuel sont générés à partir de la même structure.

La crate reprend une partie de l’API de dérivation de Clap et ne la remplace pas à l’identique : il n’y a ni API de construction ni sortie en couleur.

## Explorer le projet

- [Code source et guide](https://github.com/AlixANNERAUD/getargs_derive)
- [Documentation de l’API sur docs.rs](https://docs.rs/getargs-derive)
