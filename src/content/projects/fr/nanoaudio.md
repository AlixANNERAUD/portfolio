---
title: "nanoaudio : audio embarqué sans allocation"
description: "Une bibliothèque Rust no_std sans allocation qui convertit, mixe et décode de l’audio PCM sur microcontrôleur, avec chaînes de traitement en une passe."
---

# nanoaudio : traitement audio sans allocateur

## Présentation

`nanoaudio` fournit les briques audio dont un pilote, une tâche de mixage ou un système d’exploitation a besoin : conversion de format, volume, mixage, mise en tampon pour le DMA ou les fonctions de rappel audio, et décodeurs. Elle n’impose pas d’environnement d’exécution et ne dialogue pas avec le matériel ; c’est l’appelant qui fournit la mémoire.

Elle est publiée sur crates.io sous la forme d’une crate qui réexporte un ensemble de crates plus petites, une par codec ou par brique, utilisables aussi séparément.

## Choix techniques

- **Des tampons fournis par l’appelant.** Tout fonctionne avec `core` seul, et rien n’alloue de mémoire, ni sur le chemin critique ni ailleurs.
- **Des chaînes de traitement en une passe.** Conversion de format, répartition des canaux, volume et mixage s’enchaînent d’une source jusqu’à une sortie. Le compilateur fusionne la chaîne en une seule boucle, sans tampon intermédiaire.
- **Virgule fixe ou flottante.** Volume et mixage sont calculés en virgule fixe Q31 sur les cœurs sans unité de calcul flottant, et en `f32` sur ceux qui en ont une. Le choix par défaut dépend de la cible à la compilation ; il peut être forcé par une option Cargo ou fait à l’exécution, une fois par tampon.
- **Pensée pour le DMA et les interruptions.** Un tampon circulaire sans verrou, à un producteur et un consommateur, fournit des tranches contiguës. Aucune opération ne bloque : chacune traite ce qui tient dans le tampon et indique combien d’échantillons elle a traités.
- **Des codecs inclus.** Les encodeurs et décodeurs WAV, G.711 et IMA ADPCM donnent des résultats identiques bit à bit aux implémentations de référence ; le décodage MP3 et Opus est disponible en option.
- **Vérifiée en intégration continue.** Tests sur toutes les combinaisons d’options, exécution sous Miri et compilation pour des cibles Cortex-M0, Cortex-M4F et RISC-V.

## Explorer le projet

- [Code source, guide des codecs et exemples](https://github.com/AlixANNERAUD/nanoaudio)
- [Documentation de l’API sur docs.rs](https://docs.rs/nanoaudio)
