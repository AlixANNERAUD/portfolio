---
title: "Réseau miniature : détection S88 sans fil"
description: "L’électronique d’un réseau ferroviaire miniature numérique H0 : des modules ESP32 mesurent le courant des voies et signalent les cantons occupés au bus S88."
---

# Réseau ferroviaire miniature : l’électronique d’un réseau numérique

## Présentation

Depuis 2019, je construis un réseau ferroviaire miniature à l’échelle [H0](https://fr.wikipedia.org/wiki/%C3%89chelle_HO) avec une commande entièrement numérique [DCC](https://fr.wikipedia.org/wiki/Digital_Command_Control). Je conçois et fabrique moi-même toute son électronique, dont les circuits de détection d’occupation des cantons et les cartes de commande des signaux, en alliant conception matérielle et logiciel embarqué pour automatiser la signalisation.

## Choix techniques

Le système de rétrosignalisation S88 sans fil, publié sur GitHub, montre la démarche retenue pour la détection d’occupation :

- **Une détection par le courant.** Chaque module de détection, construit autour d’un ESP32, lit des capteurs de courant INA219 en I²C pour savoir quels cantons consomment du courant. Des programmes de test comparent les capteurs INA219 et ACS712.
- **Des modules sans fil.** Les modules transmettent l’état de leurs entrées par UDP sur Wi-Fi à un ESP32 passerelle qui les interroge tour à tour. Les cartes de détection réparties sur le réseau n’ont pas besoin de câblage de rétrosignalisation jusqu’à la centrale.
- **Une émulation du bus S88.** La passerelle est reliée au bus S88 de la centrale. Elle traite l’horloge et le signal de chargement du bus par interruptions et émet l’état de chaque entrée bit par bit, comme le ferait un module S88 filaire.

## Explorer le projet

- [Code source du système de rétrosignalisation S88 sans fil](https://github.com/AlixANNERAUD/s88_wireless_feedback_system) : micrologiciels de la passerelle et des modules de détection en C++ avec PlatformIO, et programmes de test des capteurs.
