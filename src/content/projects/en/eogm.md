---
title: "Evidential Occupancy Grid Map (EOGM)"
description: "Robotic occupancy mapping from onboard sensors, using Dempster-Shafer evidence theory."
---

# Evidential Occupancy Grid Map (EOGM)

> Robotic occupancy mapping from onboard sensors, using Dempster-Shafer evidence theory.

## Overview

Based on our professor's <a href="https://www.researchgate.net/publication/337171728_25D_Evidential_Grids_for_Dynamic_Object_Detection">research paper on pratical application of the Dempster-Shafer theory in robotics</a>, we developed a real-time algorithm that creates maps of free and occupied spaces in a robot's environment using onboard LiDAR, IMU and GPS sensors. It was developed for <a href="https://en.wikipedia.org/wiki/Robot_Operating_System">Robot Operating System (ROS)</a>. It's fast and efficient due to various memory optimizations, vectorization and parallelization techniques.

## Engineering approach

Sensor-derived occupancy maps are fused by a ROS node using evidential reasoning. The repository documents AVX2 optimizations, illustrating trade-offs between scientific computing, real-time robotics and low-level performance.

## Scope and limitations

Academic or research work, potentially collaborative. It illustrates an engineering method or experiment rather than claiming a commercially deployed product.
