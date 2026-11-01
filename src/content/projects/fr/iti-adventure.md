---
title: "ITI Aventure : un jeu d’aventure en Java"
description: "Un jeu d’aventure textuel en Java 21, écrit à deux à l’INSA Rouen Normandie : pièces, portes verrouillées, clés, monstres et mondes lus dans un fichier texte."
---

# ITI Aventure : un jeu d’aventure textuel orienté objet en Java

## Présentation

ITI Aventure est un jeu d’aventure textuel qui se joue dans le terminal. Nous l’avons écrit en Java, en binôme, pour le cours « Programmation avancée et Java » de l’INSA Rouen Normandie, en 2024. Le joueur parcourt un monde de pièces reliées par des portes, dont certaines sont verrouillées, prend et pose des objets, ouvre des portes et des coffres, tandis que des monstres errent de pièce en pièce. La partie se termine par une victoire ou une défaite dès qu’une de ses conditions de fin est remplie.

## Choix techniques

- **Une hiérarchie de classes pour le monde.** Chaque élément du monde est une entité au nom unique : objets (clés, serrures, coffres, pied-de-biche), éléments de structure (pièces et portes) et êtres vivants (le joueur humain et les monstres). Des interfaces ajoutent des comportements : `Activable` pour ce qui s’ouvre, éventuellement avec un objet, et `Executable` pour ce qui agit à chaque tour.
- **Des commandes résolues par réflexion.** Une commande saisie par le joueur, comme `Franchir Porte1`, est associée par réflexion Java à la méthode du joueur qui porte le même nom, `commandeFranchir`. Ajouter une commande revient à ajouter une méthode, sans table de correspondance à maintenir.
- **Une simulation au tour par tour.** À chaque tour, le simulateur recueille la commande du joueur, puis exécute toutes les entités actives : le joueur applique sa commande, et chaque monstre franchit au hasard une porte ouverte, perd un point de vie et échange ses objets contre ceux de la pièce.
- **Des mondes décrits dans un fichier texte.** Un fichier de description liste les pièces, les portes, les serrures, les clés, le joueur et les conditions de fin, et le simulateur construit le monde à partir de lui. Les conditions de fin, comme atteindre une pièce, posséder certains objets, mourir ou une combinaison de plusieurs d’entre elles, sont des sous-classes d’une même classe abstraite.
- **Sauvegarde et reprise.** Le monde et ses conditions de fin sont enregistrés par sérialisation Java, et le menu principal permet de les recharger.
- **Des erreurs sous forme d’exceptions, testées avec JUnit.** Une action impossible, comme franchir une porte fermée ou utiliser un objet que le joueur ne possède pas, lève une exception dédiée. Une suite JUnit couvre chaque paquetage.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/iti_aventure) : sources Java, tests JUnit et scripts de compilation.
