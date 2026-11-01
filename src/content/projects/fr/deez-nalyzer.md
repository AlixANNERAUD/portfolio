---
title: "Deez’Nalyzer : analyse musicale par le son"
description: "Une application web Django et Vue qui transforme les extraits Deezer en représentations audio MERT, pour explorer des morceaux en 3D et prédire leurs genres."
---

# Deez’Nalyzer : voir comment les morceaux se ressemblent

## Le problème

Les genres et les listes de lecture disent peu de choses sur le son réel d’un morceau, ou sur sa proximité avec un autre. Dans ce projet d’apprentissage automatique à l’INSA Rouen Normandie, notre équipe de trois voulait décrire chaque morceau par des nombres calculés à partir de l’audio lui-même, puis explorer ces nombres : voir quels morceaux sont proches, chercher des morceaux similaires et tenter de prédire les genres.

Deez’Nalyzer est un prototype universitaire pour expérimenter la recherche d’information musicale. Ce n’est pas un lecteur de streaming, et il ne génère pas d’audio.

## Architecture

L’application a deux parties. Une API Django REST Framework en Python 3.11 gère l’intégration avec Deezer et la chaîne de traitement audio et d’apprentissage automatique. Une interface Vue 3 et TypeScript affiche les résultats avec des graphiques Plotly interactifs.

Les données passent par quatre étapes :

1. **Collecter.** L’API recherche des morceaux et des listes de lecture publics sur Deezer et télécharge les extraits disponibles. Les listes importées passent par des files de téléchargement et de calcul que l’interface permet de suivre.
2. **Représenter.** Le modèle préentraîné MERT-v1-330M transforme chaque extrait en une représentation numérique de l’audio, stockée dans un jeu de données local.
3. **Explorer.** Une ACP ou UMAP projette ces représentations de grande dimension en trois dimensions, pour une vue 3D interactive.
4. **Découvrir.** La similarité cosinus entre représentations trouve les morceaux proches, et un classifieur scikit-learn prédit les genres.

## Choix techniques

- **Un modèle audio préentraîné.** MERT, chargé avec Hugging Face Transformers et PyTorch, fournit les représentations à la place de descripteurs choisis à la main ; librosa, torchaudio et FFmpeg préparent l’audio.
- **Deux projections côte à côte.** L’ACP et UMAP peuvent être comparées sur le même jeu de données, et un graphique montre la variance expliquée cumulée des composantes de l’ACP, c’est-à-dire la part de la variance conservée par les trois axes affichés.
- **Plusieurs genres par morceau.** Un morceau peut appartenir à plusieurs genres : le classifieur peut donc lui attribuer plusieurs étiquettes.
- **Des morceaux similaires, pas de génération.** La fonction Compose cherche des morceaux existants proches. Elle ne synthétise pas d’audio et ne publie pas de liste de lecture sur Deezer.
- **Des images de conteneurs.** GitHub Actions construit les images Docker de l’interface et de l’API et les publie sur GitHub Container Registry.

## Résultats

Le prototype couvre toute la chaîne : recherche Deezer et import de listes de lecture, représentations MERT, exploration 3D par ACP et UMAP, recherche de similarité et classification par genre. Le code est ouvert, sous licence MIT. Deez’Nalyzer est un projet étudiant indépendant, sans lien avec Deezer et non approuvé par Deezer.

## Limites

- MERT est un modèle volumineux : son chargement demande du temps et beaucoup de mémoire, surtout sur processeur.
- La plupart des analyses nécessitent d’abord un jeu de données rempli, et dépendent des extraits que Deezer met à disposition.
- Le fichier Docker Compose est un exemple, pas un déploiement prêt pour la production.
- Les recommandations personnalisées, l’export de listes de lecture et l’analyse des paroles restent des idées, pas des fonctions.

## Explorer le projet

- [Code source et instructions d’installation](https://github.com/AlixANNERAUD/deez_nalyzer)
