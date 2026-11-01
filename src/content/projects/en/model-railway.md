---
title: "Model railway: wireless S88 block detection"
description: "Electronics for a digital HO-scale model railway: ESP32 modules measure track current to detect occupied blocks and report them to the S88 feedback bus."
---

# Model railway network: electronics for a digital layout

## Overview

Since 2019, I have been building an [HO-scale](https://en.wikipedia.org/wiki/HO_scale) model railway layout with full [DCC](https://en.wikipedia.org/wiki/Digital_Command_Control) digital control. I design and build all its electronics myself, including block occupancy detection circuits and signal control boards, combining hardware design with embedded software for automated signaling.

## Technical choices

The wireless S88 feedback system, published on GitHub, shows the approach for occupancy detection:

- **Detection by current.** Each detection module, built around an ESP32, reads INA219 current sensors over I²C to tell which blocks draw current. Test programs compare INA219 and ACS712 sensors.
- **Wireless modules.** The modules report the state of their inputs over Wi-Fi, in UDP, to a gateway ESP32 that polls them in turn. Detection boards along the layout need no feedback wiring back to the command station.
- **S88 emulation.** The gateway is wired to the command station's S88 bus. It handles the bus clock and load signals in interrupts and shifts out the state of each input, as a wired S88 module would.

## Explore the project

- [Source code of the wireless S88 feedback system](https://github.com/AlixANNERAUD/s88_wireless_feedback_system): the gateway and detection module firmware in C++ with PlatformIO, and the sensor test programs.
