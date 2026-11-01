---
title: "Prédire la dansabilité d’un titre Spotify"
description: "Projet d’équipe en science des données qui modélise la dansabilité Spotify par régression linéaire multiple sur 160 000 titres, puis teste le modèle via l’API."
---

# Expliquer le score de dansabilité de Spotify par la régression linéaire

## Le problème

Spotify attribue à chaque titre un score de dansabilité calculé à partir de son audio. Pour notre cours d’introduction à la science des données, en 2023, notre équipe de trois s’est demandé quelles caractéristiques d’un morceau expliquent ce score, et avec quelle fidélité un modèle statistique simple peut le reproduire.

Nous sommes partis d’un jeu de données Kaggle d’environ 160 000 titres sortis entre 1921 et 2020, extrait de l’API web de Spotify. La cible est l’estimation de Spotify elle-même, et non une évaluation de la manière dont les gens dansent : un modèle ajusté sur elle apprend à imiter le calcul de Spotify, biais compris.

## Architecture

L’analyse tient dans un seul carnet Jupyter en Python, accompagné d’un rapport LaTeX. Elle suit cinq étapes :

1. **Préparer.** Charger le jeu de données, supprimer les colonnes redondantes comme la date de sortie, encoder la tonalité et centrer-réduire les données.
2. **Explorer.** Représenter la distribution de chaque variable et la matrice de corrélation, puis mener une analyse en composantes principales.
3. **Modéliser.** Ajuster une régression linéaire multiple de la dansabilité sur les autres variables.
4. **Diagnostiquer.** Réduire l’ensemble des variables, retirer les valeurs aberrantes et ajuster de nouveau le modèle.
5. **Appliquer.** Rechercher des titres par l’API de Spotify, prédire leur dansabilité et comparer la prédiction au score renvoyé par Spotify.

## Choix techniques

- **Des outils Python courants.** pandas et NumPy pour les données, scikit-learn pour la régression et l’ACP, SciPy pour les tests statistiques, Matplotlib pour les graphiques et Spotipy pour l’API.
- **Un codage disjonctif complet.** La tonalité devient douze colonnes binaires, ce qui permet à la régression d’attribuer un coefficient à chaque tonalité.
- **Une sélection ascendante.** Les variables sont ajoutées une à une, et le sous-ensemble au plus faible Cp de Mallows est retenu.
- **Des valeurs aberrantes repérées par levier et contribution.** Le levier et la contribution de chaque titre au modèle sont calculés par blocs de 1 000 titres pour limiter la mémoire utilisée ; les titres au-delà des seuils sont retirés.
- **Des tests statistiques.** Un test de Shapiro-Wilk vérifie si la dansabilité suit une loi normale, et des tests de Student comparent titres explicites et non explicites sur la dansabilité et sur la popularité.

## Résultats

- La valence, le caractère parlé (speechiness), l’année et la popularité sont les variables les plus associées à une dansabilité élevée, tandis que le caractère acoustique, l’énergie et la présence d’un public la font baisser. La tonalité n’a pas d’effet significatif.
- Le modèle retenu par sélection ascendante atteint un R² d’environ 0,49, puis d’environ 0,65 après retrait des valeurs aberrantes. Ces deux valeurs sont calculées sur les données ayant servi à ajuster le modèle.
- Le carnet compare aussi la popularité des titres explicites et non explicites, mais ce test porte sur les mauvaises colonnes : nous n’en tirons aucune conclusion. Pour la dansabilité, le test a renvoyé une p-valeur exactement nulle, que nous avons jugée suspecte.
- Sur les titres récupérés par l’API, les prédictions s’écartent des scores de Spotify. Nous avons attribué ces écarts à un jeu de données peut-être daté et à des variables utilisées par Spotify mais absentes du jeu de données.

## Limites

- Le modèle peut au mieux reproduire le calcul de Spotify, pas un jugement humain sur la dansabilité.
- Faute de jeu de test séparé, les R² indiquent la qualité de l’ajustement, pas la capacité à prédire de nouveaux titres.
- L’année est traitée comme une variable continue, un choix que le carnet propose lui-même de revoir.
- Seuls des modèles linéaires ont été essayés.
- L’étape d’application demande ses propres identifiants pour l’API de Spotify.

## Explorer le projet

- [Carnet, données et rapport LaTeX](https://github.com/AlixANNERAUD/music_danceability_prediction)
