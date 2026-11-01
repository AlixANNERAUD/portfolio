---
title: "INSAtram: tram network game in Free Pascal"
description: "A tram network game modeled on Mini Metro, written in Free Pascal with SDL 1.2 by a team of three at INSA Rouen, where each passenger is routed with Dijkstra."
---

# INSAtram: a Mini Metro-style tram game in Free Pascal

## Overview

INSAtram is a tram network management game modeled on Mini Metro, by the studio Dinosaur Polo Club. We built it as a team of three for the programming project of the second year of the preparatory cycle at INSA Rouen, in 2022, working only from observations of the original game.

Stations of five shapes appear on the map, and passengers wait at them for a train to a station of their own shape. The player draws tram lines between stations; each line runs up to four trains of up to three vehicles, each carrying six passengers. Every week of play, the game offers a choice between two rewards drawn at random: a new line, a train, a wagon or a tunnel, which a line needs to cross the river. The game is lost when a station holds more than six passengers for over 40 seconds, and the score counts the passengers delivered.

## Technical choices

- **Free Pascal and SDL 1.2.** The game relies on SDL 1.2 and its extensions for images, fonts, sound and drawing. The 1.0.0 release ships binaries for Linux and Windows.
- **Route planning with Dijkstra.** For each waiting passenger, the game runs Dijkstra's algorithm over the network toward every station of the passenger's shape, weighting each connection by the distance between stations, and keeps the shortest itinerary.
- **Units by responsibility.** The code is split into Pascal units for types, constants, game logic, graphics, mouse input, animations and sounds.
- **Designed before coding.** The repository keeps the specification, the top-down analysis and the final report written for the project.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/insatram): Free Pascal sources, build scripts and project documentation (in French).
