---
title: "nanoaudio: allocation-free audio for Rust"
description: "An allocation-free no_std Rust library that converts, mixes and decodes PCM audio on microcontrollers, with single-pass pipelines and a DMA ring buffer."
---

# nanoaudio: audio processing without an allocator

## Overview

`nanoaudio` provides the audio building blocks that a driver, a mixer task or an operating system needs: format conversion, volume, mixing, buffering for DMA or audio callbacks, and decoders. It does not own a runtime and does not talk to the hardware; the caller brings the memory.

It is published on crates.io as one crate that re-exports a set of smaller ones, one per codec or building block, which can also be used on their own.

## Technical choices

- **Buffers provided by the caller.** Everything works with `core` alone, and nothing allocates, on the hot path or anywhere else.
- **Single-pass pipelines.** Format conversion, channel mapping, volume and mixing chain from a source to a sink. The compiler fuses the chain into a single loop, without intermediate buffers.
- **Fixed or floating point.** Volume and mixing run in Q31 fixed point on cores without a floating-point unit and in `f32` on cores with one. The default is chosen from the target at build time, can be forced with a feature, or selected at run time once per buffer.
- **Made for DMA and interrupts.** A lock-free single-producer, single-consumer ring buffer hands out contiguous slices. Every operation is non-blocking: it processes what fits and reports how much it did.
- **Codecs included.** WAV, G.711 and IMA ADPCM encoders and decoders are bit-exact with the reference implementations; MP3 and Opus decoding sit behind optional features.
- **Checked in CI.** Tests on every combination of features, runs under Miri, and builds for Cortex-M0, Cortex-M4F and RISC-V targets.

## Explore the project

- [Source code, codec guide and examples](https://github.com/AlixANNERAUD/nanoaudio)
- [API documentation on docs.rs](https://docs.rs/nanoaudio)
