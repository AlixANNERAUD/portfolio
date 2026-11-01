---
title: "battery-percent: C99 battery charge library"
description: "A tiny C99 library with no_std Rust bindings that turns a battery voltage into a charge percentage on any microcontroller, using real discharge curves."
---

# battery-percent: battery voltage to charge percentage

## Overview

`battery-percent` estimates a battery's state of charge from its voltage. It is a small C99 library with `no_std` Rust bindings, published on crates.io and in the PlatformIO registry. The application reads the voltage however its board allows and passes millivolts; the library returns a percentage.

A linear mapping between the empty and full voltages is misleading: a lithium cell spends most of its life between 3.6 and 3.9 V, so a straight line shows a half-full battery that is about to die. The library uses discharge curves instead, built in for LiPo, Li-ion 18650, LiFePO4, NiMH and alkaline cells, and accepts custom curves measured on your own cells.

## Technical choices

- **Curves from published data.** Each built-in curve comes from a datasheet, an application note or lab measurements, and the library interpolates between its points.
- **No hardware dependency.** The library takes millivolts and does not read any pin, so the same code runs on any microcontroller, on Linux and in unit tests. A helper converts a raw ADC reading to millivolts, taking a voltage divider into account, and series packs are supported.
- **Readings that do not jump.** An integer moving average smooths ADC noise. A display stabilizer then lets the shown percentage only go down while discharging and only up while charging, with hysteresis and a rate limit.
- **Integer-only C99, no allocation.** The README gives about 1 KB of flash on a Cortex-M4 with every function and curve. The C core is tested under address and undefined-behavior sanitizers, and the Rust crate compiles it with `cc`.

Voltage only gives an estimate: it is most reliable at rest and at room temperature, and some chemistries, such as LiFePO4, have a nearly flat curve over a wide range. A fuel gauge IC remains the precise option.

## Explore the project

- [Source code, curves and examples](https://github.com/AlixANNERAUD/battery-percent)
- [battery-percent on crates.io](https://crates.io/crates/battery-percent)
