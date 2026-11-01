---
title: "Enceinte connectée : amplificateur en Wi-Fi"
description: "Un ESP32 qui commande un amplificateur hi-fi TDA7294 en Wi-Fi ou par télécommande infrarouge : volume, sourdine et marche, depuis une interface web embarquée."
---

# Enceinte connectée : commande Wi-Fi et infrarouge d’un amplificateur hi-fi

## Présentation

Pour les soirées à la maison, je voulais une enceinte pilotable en Wi-Fi ou avec une télécommande infrarouge. J’ai conçu un système de commande pour une carte amplificatrice à base de TDA7294, avec un ESP32 et des composants du commerce. L’ESP32 sert une interface web depuis laquelle n’importe quel appareil du réseau local peut régler le volume, couper le son ou éteindre l’amplificateur.

## Choix techniques

- **Un volume asservi.** L’ESP32 fait monter ou descendre le potentiomètre de volume jusqu’à ce que la position lue sur une entrée analogique corresponde au niveau demandé. L’amplificateur est éteint quand le volume est à zéro ou en sourdine.
- **Des télécommandes apprises depuis le navigateur.** L’interface web enregistre les codes marche, volume et sourdine de cinq télécommandes infrarouges au plus : n’importe quelle télécommande existante peut servir.
- **Un serveur web sur le microcontrôleur.** Un serveur web asynchrone sert les pages HTML, CSS et JavaScript depuis la mémoire flash de l’ESP32, derrière une connexion dont les sessions expirent au bout de cinq minutes.
- **Aucun câble pour la configuration.** La carte rejoint le réseau Wi-Fi de la maison ou, à défaut, crée son propre point d’accès. Elle s’annonce sur le réseau par mDNS, accepte les mises à jour du micrologiciel en Wi-Fi, et une LED RVB indique son état.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/connected_speaker) : micrologiciel C++ compilé avec PlatformIO et interface web.
