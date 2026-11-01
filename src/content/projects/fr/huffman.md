---
title: "Codage de Huffman : un compresseur en C"
description: "Un compresseur Huffman en C, écrit à quatre à l’INSA Rouen Normandie, avec son propre en-tête de fichier, des tests unitaires CUnit et des tests aller-retour."
---

# Codage de Huffman : un compresseur de fichiers sans perte en C

## Présentation

Ce compresseur est un projet de groupe du cours « Algorithmique avancée et programmation C » de l’INSA Rouen Normandie, en 2023. À quatre, nous avons mis en œuvre le codage de Huffman en C, du comptage des octets d’un fichier jusqu’à l’écriture et la relecture d’un flux de bits compressé.

Le programme propose deux commandes : `huffman c FICHIER` compresse un fichier en `FICHIER.huff`, et `huffman d FICHIER.huff` restitue l’original.

## Choix techniques

- **Les effectifs dans l’en-tête.** Le compresseur compte les occurrences de chacune des 256 valeurs d’octet, construit l’arbre de Huffman à partir de ces effectifs avec une file de priorité, puis en déduit une table de codage. Le fichier compressé commence par l’identifiant `HUFF` suivi des effectifs : le décompresseur reconstruit ainsi le même arbre au lieu d’en lire une copie.
- **Une écriture bit à bit.** Les codes de longueur variable sont regroupés en octets au fil de l’eau, et le dernier octet, incomplet, est écrit à la fin.
- **Des cas limites traités.** Un fichier vide, ou composé d’un seul octet répété, est stocké sous la forme d’un simple en-tête, puisqu’un arbre de Huffman demande au moins deux symboles.
- **Une décompression vérifiée.** Après la décompression, le programme recompte les octets du résultat et les compare à l’en-tête : un fichier corrompu est signalé au lieu de passer inaperçu.
- **Un module par structure de données.** Bits, octets, codes binaires, file de priorité, arbre de Huffman, table de codage et statistiques ont chacun leur module C, documenté avec Doxygen.
- **Deux niveaux de tests.** Des tests unitaires CUnit couvrent chaque module. Un script Python compresse puis décompresse des fichiers générés (vide, un seul octet, Lorem ipsum, contenu aléatoire, équilibré et déséquilibré) et compare leurs empreintes SHA-256 et leurs tailles.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/huffman_compressor) : sources C, makefile, tests et rapport LaTeX.
