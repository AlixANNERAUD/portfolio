---
title: "EOGM : cartographie évidentielle sous ROS"
description: "Un nœud ROS en C++ qui fusionne balayages LiDAR et odométrie dans une grille d’occupation évidentielle (théorie de Dempster-Shafer), accéléré par AVX2."
---

# Cartographie d’occupation évidentielle pour un robot mobile

## Le problème

Une grille d’occupation classique estime si chaque cellule de l’environnement d’un robot est libre ou occupée. Un vrai robot doit aussi composer avec des observations incomplètes, des mesures contradictoires et des obstacles mobiles, qu’une seule probabilité par cellule masque.

Dans ce projet de troisième année du cycle ingénieur à l’INSA Rouen Normandie (2023-2024), notre binôme a mis en œuvre une grille d’occupation évidentielle (EOGM). Selon la théorie de Dempster-Shafer, chaque cellule porte des masses de croyance pour quatre états : libre, occupé, inconnu et conflit. Le travail s’appuie sur un [article de recherche de notre enseignant](https://www.researchgate.net/publication/337171728_25D_Evidential_Grids_for_Dynamic_Object_Detection) consacré aux grilles évidentielles pour la détection d’objets dynamiques.

## Architecture

Le projet est un nœud ROS 1 écrit en C++11 pour ROS Melodic. Chaque balayage LiDAR passe par cinq étapes :

1. **Observer.** Lire le balayage et la dernière odométrie.
2. **Tracer.** Suivre chaque faisceau avec l’algorithme de Bresenham : les cellules traversées sont marquées libres, et celle où il touche un obstacle est marquée occupée.
3. **Attribuer les masses.** Convertir ces observations en masses de croyance dans une grille évidentielle locale.
4. **Fusionner.** Recaler la grille locale grâce à l’odométrie, puis la combiner avec la carte globale selon une règle de combinaison évidentielle, après affaiblissement des informations anciennes.
5. **Publier.** Convertir la carte globale en message OctoMap sur le topic `/global_eogm`, affiché dans RViz.

## Choix techniques

- **Une incertitude explicite.** Les états inconnu et conflit ont chacun leur propre masse : la carte montre où les capteurs se contredisent au lieu de lisser ce désaccord.
- **Un affaiblissement temporel.** Les observations anciennes comptent de moins en moins, ce qui permet à la carte de suivre un environnement qui change.
- **Une vectorisation AVX2.** Les opérations sur les masses de croyance utilisent des instructions AVX2 sur des lots de huit valeurs en simple précision.
- **Un parallélisme OpenMP.** La conversion des balayages et la fusion des grilles s’exécutent sur plusieurs cœurs.
- **Une sortie ROS standard.** Publier un message OctoMap permet à RViz d’afficher les cellules libres, occupées et en conflit sans visualiseur dédié.

## Résultats

Nous avons testé le nœud sur un robot Robotnik Summit-XL de la plateforme P.E.R.M.I.S. de l’INSA, dans une salle d’environ 7 × 6 m. D’après notre rapport, les limites de la salle étaient cartographiées de façon cohérente, les objets mobiles apparaissaient dans les observations, et le nœud tournait à environ 15 Hz pendant cette expérience. Cette fréquence est une observation issue d’une seule expérience, pas une mesure de performance, et aucun gain d’AVX2 par rapport à une version scalaire n’est revendiqué.

## Limites

- Le bruit de la centrale inertielle et de l’odométrie a créé des conflits près des murs ; la localisation et le filtrage des données inertielles demanderaient du travail supplémentaire.
- Le code cible ROS Melodic sous Ubuntu 18.04, deux versions en fin de vie, et nécessite un processeur x86 compatible AVX2. Il n’a pas été testé sur des versions plus récentes de ROS ni sur ROS 2.
- Les topics, la taille de la grille et la résolution sont fixés dans le code source au lieu d’être des paramètres ROS.
- C’est un prototype de recherche, pas un système SLAM complet.

## Explorer le projet

- [Code source et rapport LaTeX](https://github.com/AlixANNERAUD/Evidential_occupancy_map)
