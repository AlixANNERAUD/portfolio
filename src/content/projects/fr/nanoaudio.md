---
title: "nanoaudio"
description: "Bibliothèque audio embarquée sans allocation : traitement PCM, mixage, buffers circulaires et codecs avec buffers fournis par l’appelant."
---

# nanoaudio

> Bibliothèque audio embarquée sans allocation : traitement PCM, mixage, buffers circulaires et codecs avec buffers fournis par l'appelant.

## Présentation

Bibliothèque Rust `no_std` de traitement audio à mémoire maîtrisée. Elle inclut conversion PCM, mixage, variation du volume, buffers circulaires pour le DMA et plusieurs codecs. Les fonctions travaillent avec des buffers fournis par l'appelant et sont destinées à être intégrées à des pilotes ou à un OS. [Code et exemples](https://github.com/AlixANNERAUD/nanoaudio).

## Démarche technique

La bibliothèque sépare le traitement des échantillons PCM du matériel audio et de l'ordonnancement. Les buffers appartiennent à l'appelant : cela réduit les allocations implicites et permet d'intégrer codecs, mixage et conversions dans des pilotes.

## Portée et limites

Bibliothèque conçue pour être réutilisée indépendamment d'une application. Les API et exemples à jour figurent dans le dépôt source ; les contraintes d'environnement et les versions supportées doivent y être vérifiées.
