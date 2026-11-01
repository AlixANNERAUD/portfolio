---
title: "Enceinte connectée"
description: "Commande Wi-Fi d’un amplificateur hi-fi avec microcontrôleur ESP32 et interface web."
---

# Enceinte connectée

> Commande Wi-Fi d'un amplificateur hi-fi avec microcontrôleur ESP32 et interface web.

## Présentation

Conception d'un système de télécommande sans fil pour un amplificateur hi-fi basé sur TDA7294, à l'aide d'un ESP32 et de composants disponibles dans le commerce. L'ESP32 héberge une interface web permettant de contrôler le volume, la sélection d'entrée et l'alimentation depuis n'importe quel appareil sur le réseau local.

## Démarche technique

La commande est assurée localement par l'ESP32 : le navigateur sert d'interface utilisateur, tandis que le microcontrôleur commande les entrées et le volume de l'amplificateur. Ce projet illustre l'intégration du matériel et d'un service HTTP embarqué.

## Portée et limites

Projet personnel : les choix techniques et le maintien à long terme guident l'évolution. La fiche décrit les fonctions documentées, pas des performances ou usages non mesurés.
