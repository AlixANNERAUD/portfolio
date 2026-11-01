---
title: "Segmentation histopathologique du mélanome"
description: "Adaptation de CellViT++, nnU-Net et HoVer-Net pour classer les noyaux et segmenter les tissus d’images de mélanome (jeu PUMA), en binôme à l’INSA Rouen."
---

# Apprentissage profond pour l’histopathologie du mélanome

## Le problème

Le [challenge PUMA](https://puma.grand-challenge.org/) porte sur la segmentation des noyaux et des tissus dans des images histopathologiques de mélanome avancé. Il réunit deux tâches : localiser chaque noyau cellulaire et identifier son type, par exemple cellule tumorale ou lymphocyte, et segmenter des régions de tissu plus vastes, comme la tumeur et le stroma. Le jeu de données fournit des régions colorées à l’hématoxyline-éosine de 1 024 × 1 024 pixels, avec des annotations relues par des experts au format GeoJSON.

Pour notre projet d’apprentissage profond à l’INSA Rouen Normandie, en 2025, notre binôme a étudié comment adapter des modèles existants d’imagerie médicale à ces tâches, plutôt que de concevoir un nouveau réseau.

## Architecture

Le dépôt consacre un répertoire à chaque modèle, avec son propre environnement Python, et intègre les implémentations d’origine sous forme de sous-modules Git :

- **CellViT++.** Conversion des annotations PUMA, entraînement d’une tête de classification des noyaux sur un encodeur (backbone) CellViT-SAM-H, et recherche d’hyperparamètres suivie avec Weights & Biases.
- **nnU-Net.** Préparation des jeux de données PUMA et NSCLC, une classe d’entraînement (trainer) et une fonction de perte personnalisées qui ignorent une valeur d’étiquette, et une chaîne qui préentraîne le modèle sur NSCLC avant de l’affiner sur PUMA.
- **HoVer-Net.** Préparation de vignettes d’images et de masques d’annotation.

Les entraînements ont tourné sous forme de tâches SLURM sur une grappe de GPU. Un carnet de présentation rassemble la motivation, le choix des modèles, les journaux d’expériences et les résultats.

## Choix techniques

- **Des modèles reconnus.** S’appuyer sur CellViT++, nnU-Net et HoVer-Net nous a permis de consacrer le projet à la préparation des données, à l’entraînement et à l’analyse.
- **Une conversion des annotations.** Des scripts Python transforment les annotations GeoJSON en masques et dans les formats attendus par chaque modèle.
- **Un environnement par modèle.** Chaque répertoire possède son propre projet uv et son fichier de verrouillage, car les trois modèles ne partagent pas leurs dépendances.
- **Un apprentissage par transfert.** La chaîne nnU-Net part d’un modèle préentraîné sur le jeu NSCLC, consacré au cancer du poumon, avant l’entraînement sur les images de mélanome.

## Résultats

Notre principale expérience aboutie utilise CellViT++ avec une tête de classification entraînée. Sur le jeu de validation, notre présentation indique une AUROC d’environ 0,93, un score F1 d’environ 0,77 et une précision moyenne d’environ 0,45. Ces valeurs ont été obtenues sur le jeu de validation : ce ne sont ni des résultats sur un jeu de test ni un classement PUMA.

L’entraînement de nnU-Net s’est bloqué dans l’environnement de la grappe, et HoVer-Net est resté une intégration expérimentale : le projet ne compare donc pas les trois modèles.

## Limites

- Les expériences se sont heurtées au déséquilibre des classes, à la disponibilité limitée des GPU, à des conflits de dépendances et à des difficultés de reproductibilité.
- Les scripts SLURM contiennent des chemins et des réglages propres à notre grappe, et une exécution complète à partir du seul dépôt n’est pas garantie.
- Les jeux de données et les poids des modèles ne sont pas inclus, et les correspondances d’étiquettes des scripts de conversion ne sont pas entièrement configurées.
- C’est du code de recherche pédagogique, pas un outil de diagnostic validé cliniquement.

## Explorer le projet

- [Code source, scripts et présentation](https://github.com/AlixANNERAUD/deep_learning_project)
