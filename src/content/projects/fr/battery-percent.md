---
title: "battery-percent : niveau de batterie en C99"
description: "Une bibliothèque C99, avec liaisons Rust no_std, qui convertit la tension d’une batterie en pourcentage de charge grâce à des courbes de décharge mesurées."
---

# battery-percent : de la tension au pourcentage de charge

## Présentation

`battery-percent` estime l’état de charge d’une batterie à partir de sa tension. C’est une petite bibliothèque C99 avec des liaisons Rust `no_std`, publiée sur crates.io et dans le registre PlatformIO. L’application lit la tension comme sa carte le permet et transmet des millivolts ; la bibliothèque renvoie un pourcentage.

Une correspondance linéaire entre la tension d’une batterie vide et celle d’une batterie pleine est trompeuse : une cellule lithium passe l’essentiel de sa vie entre 3,6 et 3,9 V, si bien qu’une droite affiche une batterie à moitié pleine alors qu’elle est presque vide. La bibliothèque utilise donc des courbes de décharge, intégrées pour les cellules LiPo, Li-ion 18650, LiFePO4, NiMH et alcalines, et accepte des courbes personnalisées, mesurées sur les cellules utilisées.

## Choix techniques

- **Des courbes issues de données publiées.** Chaque courbe intégrée provient d’une fiche technique, d’une note d’application ou de mesures en laboratoire, et la bibliothèque interpole entre ses points.
- **Aucune dépendance au matériel.** La bibliothèque reçoit des millivolts et ne lit aucune broche : le même code tourne sur n’importe quel microcontrôleur, sous Linux et dans les tests unitaires. Une fonction convertit une mesure brute du CAN en millivolts en tenant compte d’un pont diviseur, et les batteries de plusieurs cellules en série sont prises en charge.
- **Des mesures qui ne sautent pas.** Une moyenne glissante entière lisse le bruit du CAN. Un stabilisateur d’affichage ne laisse ensuite le pourcentage que descendre pendant la décharge et monter pendant la charge, avec hystérésis et limite de vitesse.
- **C99, arithmétique entière, sans allocation.** Le README annonce environ 1 Ko de mémoire flash sur un Cortex-M4 avec toutes les fonctions et courbes. Le cœur C est testé avec AddressSanitizer et UndefinedBehaviorSanitizer, et la crate Rust le compile avec `cc`.

La tension ne donne qu’une estimation : elle est plus fiable au repos et à température ambiante, et certaines chimies, comme le LiFePO4, ont une courbe presque plate sur une large plage. Une jauge de batterie dédiée reste la solution précise.

## Explorer le projet

- [Code source, courbes et exemples](https://github.com/AlixANNERAUD/battery-percent)
- [battery-percent sur crates.io](https://crates.io/crates/battery-percent)
