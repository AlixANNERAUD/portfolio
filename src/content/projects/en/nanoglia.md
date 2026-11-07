---
title: "nanoglia: Rust TinyML for microcontrollers"
description: "A no_std Rust engine that loads TensorFlow Lite models at run time and runs them on microcontrollers, without a heap, an RTOS or a vendor SDK."
---

# nanoglia: neural networks loaded at run time on a microcontroller

## Overview

`nanoglia` runs TensorFlow Lite (LiteRT) models on microcontrollers. The model stays a file: it is read at run time from flash, RAM, an SD card or the network, so it can be updated without reflashing the firmware. It is a `no_std` Rust crate published on crates.io, with a C API for C and C++ firmware, under the Apache-2.0 license.

Running a neural network on a microcontroller usually means a trade-off. TensorFlow Lite Micro is C++, and reaching each vendor's optimized kernels goes through that vendor's SDK. The Rust engines compile the model into the firmware at build time, so a new model means a new firmware.

## Technical choices

- **Models loaded at run time, in place.** Loading checks the bytes and runs them where they are: the weights are never copied, even from memory-mapped flash.
- **Each chip's kernels, without an SDK.** Arm's CMSIS-NN on Cortex-M and Espressif's ESP-NN on the ESP32-S3 ship with the crates and are compiled by Cargo. Each operator runs on the fastest backend that supports it exactly, and falls back to portable code otherwise. An application can add its own backend, for instance to drive an accelerator.
- **Memory chosen by the caller.** One allocation per model, one per inference context and none per inference, from the allocator passed in or a static buffer sized ahead of time. The MLPerf Tiny keyword-spotting model needs 23.3 KiB.
- **The same results as on a computer.** The kernels reproduce TensorFlow Lite's fixed-point arithmetic bit for bit. More than 200 golden cases generated with LiteRT's reference kernels, MLPerf Tiny models included, run on every commit, on the host and in WebAssembly.
- **Safe on untrusted models.** A corrupted or malicious file returns an error and never causes a panic. The model reader forbids `unsafe` code and is fuzzed in CI.
- **From Cortex-M0+ to WebAssembly.** CI builds the library for Cortex-M0+, M4F and M33, the ESP32-S3, RISC-V and WebAssembly, along with a complete firmware for the Arduino Nano 33 BLE. The DSP and SIMD code paths are built but not yet validated on hardware.

## Explore the project

- [Source code, documentation and benchmarks](https://github.com/AlixANNERAUD/nanoglia)
- [API documentation on docs.rs](https://docs.rs/nanoglia)
