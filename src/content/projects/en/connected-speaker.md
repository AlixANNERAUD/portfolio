---
title: "Connected speaker: Wi-Fi amplifier control"
description: "An ESP32 that controls a TDA7294 hi-fi amplifier over Wi-Fi or with infrared remotes: volume, mute and power, from a web interface served by the board."
---

# Connected speaker: Wi-Fi and infrared control for a hi-fi amplifier

## Overview

For parties at home, I wanted a speaker I could control over Wi-Fi or with an infrared remote. I built a control system for a TDA7294-based amplifier board, using an ESP32 and off-the-shelf components. The ESP32 serves a web interface from which any device on the local network can set the volume, mute the amplifier or switch it off.

## Technical choices

- **Closed-loop volume.** The ESP32 drives the volume potentiometer up or down until the position it reads on an analog input matches the requested level. The amplifier is switched off when the volume is at zero or muted.
- **Remotes learned from the browser.** The web interface records the power, volume and mute codes of up to five infrared remotes, so any existing remote can be reused.
- **Web server on the microcontroller.** An asynchronous web server serves the HTML, CSS and JavaScript pages from the ESP32's flash memory, behind a login whose sessions expire after five minutes.
- **No cable needed for setup.** The board joins the home Wi-Fi network or, if it cannot, opens its own access point. It announces itself with mDNS, accepts firmware updates over Wi-Fi, and an RGB LED shows its state.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/connected_speaker): C++ firmware built with PlatformIO, and the web interface.
