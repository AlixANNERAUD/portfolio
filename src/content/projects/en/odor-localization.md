---
title: "Gas source localization with MQ sensors"
description: "A research prototype from an internship at NYU: ESP32 nodes send MQ gas sensor readings over MQTT, and a Python backend estimates where the gas comes from."
---

# Locating a gas source with a network of low-cost sensors

## The problem

When a gas is released in a room, can a few low-cost sensors placed at known positions tell where it comes from? This was the subject of my research internship at New York University, in the summer of 2024. Our team of two built a prototype to study it: a simulation of gas diffusion, the firmware of the sensor nodes and a processing backend.

## Architecture

Readings go through four stages:

1. **Acquire.** Each node is an ESP32 that reads MQ gas sensors on its analog inputs, timestamps each reading with network time and shows its status on a small OLED screen.
2. **Transmit.** Nodes publish their readings as JSON messages over Wi-Fi to an MQTT broker.
3. **Process.** A Python backend subscribes to the broker, converts each reading into a sensor resistance and a gas concentration, filters the signals and estimates the source position.
4. **Display.** A Tkinter window with Matplotlib charts shows the raw and filtered signals, the delays between sensors and the estimated position of the source.

## Technical choices

- **Simulation first.** A notebook simulates gas released continuously at one point of a plane, following Fick's second law of diffusion, solved by finite differences within the CFL stability condition. It generates readings from virtual sensors for several diffusion coefficients and source positions, stored in HDF5 files.
- **Per-sensor calibration.** At startup, the backend can record clean air for a set duration and report each sensor's baseline resistance, R₀, with its spread. R₀ then anchors the curve that converts resistance into concentration.
- **Zero-phase filtering.** A fourth-order Butterworth low-pass filter, applied forward and backward, smooths each signal without delaying it. A sensor counts as reacting when the gradient of its filtered signal crosses a threshold.
- **Delays, then position.** Once every sensor has reacted, the delays between their signals are estimated by cross-correlation in the frequency domain. A Nelder-Mead optimization then fits a source position and a propagation coefficient to these delays, in the manner of time-difference-of-arrival (TDOA) localization.

## Results

The repository covers the whole chain, from simulated diffusion to live sensor readings and a displayed estimate of the source position. It does not record a measured localization accuracy, so this page claims none.

## Limitations

- Documentation is minimal: the README holds only the architecture diagram.
- The broker address, the sensor positions and the calibration constants are written in a configuration file for one specific setup.
- The localization was not validated in the field.
- It is a research prototype, not a finished product.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/odor_localization): ESP32 firmware, Python backend and simulation notebook.
