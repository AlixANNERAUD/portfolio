---
title: "nanoglia : TinyML Rust sur microcontrôleur"
description: "Un moteur Rust no_std qui charge des modèles TensorFlow Lite à l’exécution et les fait tourner sur microcontrôleur, sans tas, sans RTOS ni SDK constructeur."
---

# nanoglia : des réseaux de neurones chargés à l’exécution sur microcontrôleur

## Présentation

`nanoglia` exécute des modèles TensorFlow Lite (LiteRT) sur microcontrôleur. Le modèle reste un fichier : il est lu à l’exécution depuis la flash, la RAM, une carte SD ou le réseau, et peut donc être mis à jour sans reflasher le firmware. C’est une crate Rust `no_std` publiée sur crates.io, avec une API C pour les firmwares en C et C++, sous licence Apache-2.0.

Faire tourner un réseau de neurones sur microcontrôleur impose d’habitude un compromis. TensorFlow Lite Micro est écrit en C++, et profiter des noyaux optimisés de chaque constructeur passe par son SDK. Les moteurs en Rust compilent le modèle dans le firmware : un nouveau modèle demande un nouveau firmware.

## Choix techniques

- **Des modèles chargés à l’exécution, sur place.** Le chargement vérifie les octets et les exécute là où ils se trouvent : les poids ne sont jamais copiés, même depuis une flash projetée en mémoire.
- **Les noyaux de chaque puce, sans SDK.** CMSIS-NN d’Arm sur Cortex-M et ESP-NN d’Espressif sur ESP32-S3 sont fournis avec les crates et compilés par Cargo. Chaque opérateur s’exécute sur le moteur le plus rapide qui le prend en charge exactement, et se rabat sinon sur du code portable. Une application peut ajouter son propre moteur, par exemple pour piloter un accélérateur.
- **La mémoire choisie par l’appelant.** Une allocation par modèle, une par contexte d’inférence et aucune par inférence, depuis l’allocateur fourni ou un tampon statique dimensionné à l’avance. Le modèle de détection de mots-clés de MLPerf Tiny tient dans 23,3 Kio.
- **Les mêmes résultats que sur ordinateur.** Les noyaux reproduisent bit à bit l’arithmétique en virgule fixe de TensorFlow Lite. Plus de 200 cas de référence générés avec les noyaux de LiteRT, dont des modèles MLPerf Tiny, tournent à chaque commit, sur la machine hôte et en WebAssembly.
- **Sûr face à des modèles non fiables.** Un fichier corrompu ou malveillant renvoie une erreur et ne provoque jamais de panique. Le lecteur de modèles interdit le code `unsafe` et est fuzzé en intégration continue.
- **Du Cortex-M0+ au WebAssembly.** L’intégration continue compile la bibliothèque pour Cortex-M0+, M4F et M33, l’ESP32-S3, RISC-V et WebAssembly, ainsi qu’un firmware complet pour l’Arduino Nano 33 BLE. Les chemins de code DSP et SIMD sont compilés mais pas encore validés sur matériel.

## Explorer le projet

- [Code source, documentation et mesures de performance](https://github.com/AlixANNERAUD/nanoglia)
- [Documentation de l’API sur docs.rs](https://docs.rs/nanoglia)
