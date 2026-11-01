---
title: "EOGM: evidential occupancy mapping in ROS"
description: "A C++ ROS node that fuses LiDAR scans and odometry into an evidential occupancy grid using Dempster-Shafer theory, sped up with AVX2 and OpenMP."
---

# Evidential occupancy grid mapping for a mobile robot

## The problem

A classic occupancy grid estimates whether each cell of a robot's surroundings is free or occupied. A real robot also faces incomplete observations, conflicting measurements and moving obstacles, which a single probability per cell hides.

In this third-year engineering project at INSA Rouen Normandie (2023–2024), our team of two implemented an evidential occupancy grid map (EOGM). Following Dempster-Shafer theory, each cell carries belief masses for four states: free, occupied, unknown and conflict. The work builds on a [research paper by our professor](https://www.researchgate.net/publication/337171728_25D_Evidential_Grids_for_Dynamic_Object_Detection) on evidential grids for dynamic object detection.

## Architecture

The project is a ROS 1 node written in C++11 for ROS Melodic. For each LiDAR scan, it goes through five steps:

1. **Observe.** Read the scan and the latest odometry.
2. **Rasterize.** Trace each beam with Bresenham's algorithm: cells along the beam are marked free, and the cell where it hits an obstacle is marked occupied.
3. **Assign evidence.** Turn these observations into belief masses in a local evidential grid.
4. **Fuse.** Align the local grid using odometry, then combine it with the global map using an evidential combination rule, after discounting older information.
5. **Publish.** Convert the global map into an OctoMap message on the `/global_eogm` topic, displayed in RViz.

## Technical choices

- **Uncertainty kept explicit.** Unknown and conflicting evidence each get their own mass, so the map shows where sensors disagree instead of averaging it away.
- **Temporal discounting.** Older observations count less and less, so the map can follow a changing environment.
- **AVX2 vectorization.** Belief-mass operations use AVX2 intrinsics on batches of eight single-precision values.
- **OpenMP parallelism.** Scan conversion and grid fusion run on several cores.
- **Standard ROS output.** Publishing an OctoMap message lets RViz show free, occupied and conflicting cells without a custom viewer.

## Results

We tested the node on a Robotnik Summit-XL robot from the INSA P.E.R.M.I.S. platform, in a room of about 7 × 6 m. According to our report, the room boundaries were mapped coherently, moving objects were visible in the observations, and the node ran at about 15 Hz during that experiment. This rate is an observation from one experiment, not a benchmark, and no speedup over a scalar version is claimed for AVX2.

## Limitations

- IMU and odometry noise caused conflicts near the room boundaries; localization and IMU filtering would need further work.
- The code targets ROS Melodic on Ubuntu 18.04, both end-of-life, and needs an x86 processor with AVX2. It has not been tested on newer ROS versions or ROS 2.
- Topics, grid size and resolution are set in the source code rather than exposed as ROS parameters.
- It is a research prototype, not a complete SLAM system.

## Explore the project

- [Source code and LaTeX report](https://github.com/AlixANNERAUD/Evidential_occupancy_map)
