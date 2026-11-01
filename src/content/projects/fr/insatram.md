---
title: "INSAtram : jeu de tramway en Free Pascal"
description: "Un jeu de tramway inspiré de Mini Metro, écrit en Free Pascal avec SDL 1.2 par une équipe de trois à l’INSA Rouen, avec des trajets calculés par Dijkstra."
---

# INSAtram : un jeu de tramway à la Mini Metro en Free Pascal

## Présentation

INSAtram est un jeu de gestion de réseau de tramway inspiré de Mini Metro, du studio Dinosaur Polo Club. Nous l’avons réalisé à trois pour le projet d’informatique de deuxième année du cycle préparatoire de l’INSA Rouen, en 2022, uniquement à partir d’observations du jeu original.

Des stations de cinq formes apparaissent sur la carte, et des voyageurs y attendent un train vers une station de leur forme. Le joueur trace des lignes de tramway entre les stations ; chaque ligne accueille jusqu’à quatre trains de trois voitures au plus, de six voyageurs chacune. Chaque semaine de jeu, la partie propose de choisir entre deux récompenses tirées au hasard : une nouvelle ligne, un train, une voiture ou un tunnel, nécessaire à une ligne pour traverser le fleuve. La partie est perdue lorsqu’une station accueille plus de six voyageurs pendant plus de 40 secondes, et le score compte les voyageurs arrivés à destination.

## Choix techniques

- **Free Pascal et SDL 1.2.** Le jeu s’appuie sur SDL 1.2 et ses extensions pour les images, les polices, le son et le dessin. La version 1.0.0 fournit des exécutables pour Linux et Windows.
- **Calcul d’itinéraire par Dijkstra.** Pour chaque voyageur en attente, le jeu applique l’algorithme de Dijkstra au réseau vers chaque station de sa forme, en pondérant chaque liaison par la distance entre les stations, et retient l’itinéraire le plus court.
- **Des unités par responsabilité.** Le code est découpé en unités Pascal : types, constantes, logique du jeu, graphismes, souris, animations et sons.
- **Conçu avant d’être codé.** Le dépôt conserve le cahier des charges, l’analyse descendante et le rapport final rédigés pour le projet.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/insatram) : sources Free Pascal, scripts de compilation et documentation du projet (en français).
