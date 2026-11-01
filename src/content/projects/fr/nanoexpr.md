---
title: "nanoexpr : évaluateur d’expressions embarqué"
description: "Une bibliothèque Rust no_std, avec liaisons C, qui analyse et évalue des formules mathématiques saisies à l’exécution sur microcontrôleur, sans allocation."
---

# nanoexpr : évaluer des formules mathématiques sans allocation

## Présentation

`nanoexpr` analyse et évalue des formules mathématiques saisies à l’exécution, comme `raw * 0.0125 - 40`, sur un microcontrôleur et sans allocation dynamique. C’est une crate Rust `no_std` publiée sur crates.io, avec des liaisons C et C++ compilées via CMake.

Laisser l’utilisateur saisir une formule est courant : une calculatrice, une conversion de capteur réglée sur le terrain, un seuil d’alarme stocké dans un fichier de configuration. La plupart des crates d’expressions visent les ordinateurs de bureau. Elles exigent `std`, allouent un arbre syntaxique à chaque appel et transforment une saisie erronée en `NaN` ou en panique. Sur un microcontrôleur, cela signifie fragmentation du tas, consommation mémoire imprévisible et plantages.

## Choix techniques

- **Évaluer pendant l’analyse.** Ni arbre syntaxique ni tampon de jetons : le résultat est calculé au fil de la lecture du texte. Un test avec un allocateur instrumenté vérifie qu’aucune allocation n’a lieu.
- **Une pile bornée.** L’imbrication est limitée à 32 niveaux par défaut, si bien qu’une saisie malveillante ne peut pas faire déborder la pile, et les arguments d’appel tiennent dans un tableau de taille fixe. L’évaluateur et les liaisons C sont testés par fuzzing avec `cargo-fuzz`.
- **N’importe quel type numérique.** `f32`, `f64`, des entiers qui signalent les dépassements au lieu de boucler, ou un type personnalisé via un trait. Les types optionnels `Decimal` et `Fraction` calculent comme une calculatrice de poche : `0.1 + 0.2` vaut exactement `0.3`.
- **Des erreurs faites pour être affichées.** Chaque erreur porte un type et la plage d’octets fautive dans la saisie. Division par zéro et erreurs de domaine sont signalées, jamais changées en `NaN` silencieux.
- **Variables et fonctions fournies par l’application.** L’évaluateur interroge un contexte pour chaque nom rencontré. Une formule peut aussi être compilée une fois dans un tampon fourni par l’appelant, puis réévaluée avec de nouvelles valeurs, toujours sans allocation.

## Explorer le projet

- [Code source, syntaxe et mesures de performance](https://github.com/AlixANNERAUD/nanoexpr)
- [Documentation de l’API sur docs.rs](https://docs.rs/nanoexpr)
