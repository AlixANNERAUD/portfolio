---
title: "ITI Aventure: text adventure game in Java"
description: "A terminal text adventure in Java 21, built by a team of two at INSA Rouen Normandie: rooms, locked doors, keys and roaming monsters, loaded from a text file."
---

# ITI Aventure: an object-oriented text adventure in Java

## Overview

ITI Aventure is a text adventure game played in the terminal. We wrote it in Java as a team of two for the "Advanced programming and Java" course at INSA Rouen Normandie, in 2024. The player moves through a world of rooms connected by doors, some of them locked, picks up and drops objects, and opens doors and chests, while monsters wander from room to room. The game ends in success or failure as soon as one of its end conditions is met.

## Technical choices

- **A class hierarchy for the world.** Every element of the world is an entity with a unique name: objects (keys, locks, chests, a crowbar), structural elements (rooms and doors) and living beings (the human player and monsters). Interfaces add behaviors: `Activable` for what can be opened, possibly with an object, and `Executable` for what acts on each turn.
- **Commands resolved by reflection.** A command typed by the player, such as `Franchir Porte1`, is mapped through Java reflection to the player's method of the same name, `commandeFranchir`. Adding a command means adding a method, with no dispatch table to maintain.
- **Turn-based simulation.** On each turn, the simulator collects the player's command, then runs every executable entity: the player carries out the command, and each monster goes through a random open door, loses a health point and swaps its objects for those in the room.
- **Worlds described in a text file.** A description file lists the rooms, doors, locks, keys, the player and the end conditions, and the simulator builds the world from it. End conditions, such as reaching a room, carrying given objects, dying or a combination of several, are subclasses of one abstract class.
- **Save and resume.** The world and its end conditions are saved with Java serialization, and the main menu loads them back.
- **Errors as exceptions, tested with JUnit.** Invalid actions, such as going through a closed door or using an object the player does not carry, raise dedicated exceptions. A JUnit suite covers each package.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/iti_aventure): Java sources, JUnit tests and build scripts.
