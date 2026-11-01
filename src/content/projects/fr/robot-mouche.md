---
title: "Robot mouche : un robot Raspberry Pi en C++"
description: "Un robot Raspberry Pi 4 programmé en C++ à quatre à l’INSA Rouen, piloté en Wi-Fi depuis une page web ou suivant une ligne repérée par sa caméra."
---

# Robot mouche : un robot télécommandé et suiveur de ligne

## Présentation

Pour le cours « Électronique pour les systèmes embarqués » de l’INSA Rouen Normandie, en 2023, notre équipe de quatre a construit un robot à deux modes : piloté librement en Wi-Fi depuis un panneau de commande web, ou suivant une ligne au sol grâce à sa caméra tout en surveillant les obstacles avec un capteur LiDAR.

Le robot s’articule autour d’un Raspberry Pi 4, avec un pilote L293D pour ses deux moteurs, un LiDAR courte portée Benewake TF-Luna, un module caméra à capteur OV5647, un écran LCD 16×2 relié par un extenseur I2C et un amplificateur MAX98357A pour jouer des sons.

## Choix techniques

- **Un programme C++ sous Linux.** Le programme principal, compilé avec PlatformIO, utilise WiringPi pour accéder aux GPIO et cpp-httplib pour son serveur HTTP.
- **Un panneau de commande web.** Une page web statique pilote le robot par une petite API HTTP : direction et vitesse du joystick, réglages comme le mode courant, et sons à jouer. Le programme convertit la direction en une vitesse pour chaque moteur.
- **La détection de ligne dans un processus séparé.** Au passage en mode suiveur de ligne, le programme C++ lance un script Python qui capture les images de la caméra avec Picamera2 et réduit les premières lignes de chaque image à un profil de luminosité de 640 valeurs. Le programme C++ lit ce profil, repère la ligne d’après les pixels qui dépassent un seuil et convertit sa position en angle de braquage. Quand la ligne est perdue, le robot tourne du côté où il l’a vue en dernier.
- **Un arrêt devant les obstacles.** En mode suiveur de ligne, le robot s’arrête tant que le LiDAR mesure un obstacle à moins de 5 cm. L’écran affiche la distance mesurée ou une alerte, et un son est joué.
- **Testable sans le robot.** L’accès aux GPIO passe par une interface de broche, avec une implémentation pour le Raspberry Pi 4 et une implémentation native : les tests unitaires Unity s’exécutent ainsi dans GitHub Actions sans matériel. Le dépôt conserve aussi un régulateur PID testé, que la version finale du suivi de ligne n’utilise pas.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/robot_mouche) : programme C++, script Python de la caméra et panneau de commande web.
