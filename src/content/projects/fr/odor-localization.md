---
title: "Localisation de sources de gaz sur ESP32"
description: "Prototype de recherche issu d’un stage à NYU : des nœuds ESP32 publient en MQTT les mesures de capteurs MQ, puis un programme Python estime l’origine du gaz."
---

# Localiser une source de gaz avec un réseau de capteurs

## Le problème

Quand un gaz se répand dans une pièce, quelques capteurs bon marché placés à des positions connues peuvent-ils indiquer d’où il vient ? C’était le sujet de mon stage de recherche à l’université de New York, à l’été 2024. Notre équipe de deux a construit un prototype pour l’étudier : une simulation de la diffusion du gaz, le micrologiciel des nœuds de mesure et un programme de traitement.

## Architecture

Les mesures franchissent quatre étapes :

1. **Acquérir.** Chaque nœud est un ESP32 qui lit des capteurs de gaz MQ sur ses entrées analogiques, horodate chaque mesure grâce à l’heure réseau et affiche son état sur un petit écran OLED.
2. **Transmettre.** Les nœuds publient leurs mesures en JSON, par Wi-Fi, auprès d’un courtier MQTT.
3. **Traiter.** Un programme Python abonné au courtier convertit chaque mesure en résistance du capteur puis en concentration de gaz, filtre les signaux et estime la position de la source.
4. **Afficher.** Une fenêtre Tkinter avec des graphiques Matplotlib montre les signaux bruts et filtrés, les décalages entre capteurs et la position estimée de la source.

## Choix techniques

- **La simulation d’abord.** Un carnet Jupyter simule un gaz émis en continu en un point d’un plan, selon la deuxième loi de Fick, résolue par différences finies dans le respect de la condition de stabilité CFL. Il produit les mesures de capteurs virtuels pour plusieurs coefficients de diffusion et positions de source, enregistrées au format HDF5.
- **Un étalonnage par capteur.** Au démarrage, le programme peut enregistrer de l’air propre pendant une durée donnée et indiquer la résistance de référence de chaque capteur, R₀, avec sa dispersion. R₀ sert ensuite de point d’ancrage à la courbe qui convertit la résistance en concentration.
- **Un filtrage sans déphasage.** Un filtre passe-bas de Butterworth d’ordre 4, appliqué dans les deux sens, lisse chaque signal sans le retarder. Un capteur est considéré comme réagissant lorsque la dérivée de son signal filtré franchit un seuil.
- **Les décalages, puis la position.** Une fois que tous les capteurs ont réagi, les décalages entre leurs signaux sont estimés par intercorrélation dans le domaine fréquentiel. Une optimisation de Nelder-Mead ajuste ensuite une position de source et un coefficient de propagation à ces décalages, à la manière d’une localisation par différence de temps d’arrivée (TDOA).

## Résultats

Le dépôt couvre toute la chaîne, de la diffusion simulée aux mesures en direct et à l’affichage d’une estimation de la position de la source. Il ne consigne pas de précision de localisation mesurée : cette page n’en revendique donc aucune.

## Limites

- La documentation est minimale : le README ne contient que le schéma d’architecture.
- L’adresse du courtier, la position des capteurs et les constantes d’étalonnage sont inscrites dans un fichier de configuration propre à un seul montage.
- La localisation n’a pas été validée sur le terrain.
- C’est un prototype de recherche, pas un produit fini.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/odor_localization) : micrologiciel ESP32, programme de traitement Python et carnet de simulation.
