---
title: "nanoaudio"
description: "Allocation-free embedded audio processing: PCM conversion, mixing, ring buffers and codecs using caller-owned memory."
---

# nanoaudio

> Allocation-free embedded audio processing: PCM conversion, mixing, ring buffers and codecs using caller-owned memory.

## Overview

An allocation-free `no_std` audio processing library providing PCM conversion, mixing, volume control, DMA-friendly ring buffers, and codecs. Its routines operate on caller-provided buffers and are designed for integration into hardware drivers and operating systems. [Code and examples](https://github.com/AlixANNERAUD/nanoaudio).

## Engineering approach

The library separates PCM sample processing from audio hardware and scheduling. Caller-owned buffers avoid implicit allocation and allow codecs, mixing and conversions to be embedded in device drivers.

## Scope and limitations

Designed as a reusable library independent of one application. Refer to the upstream repository for current APIs, examples, platform constraints and supported versions.
