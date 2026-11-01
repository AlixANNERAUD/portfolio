---
title: "lvgl_theme_shadcn: shadcn/ui theme for LVGL"
description: "A C99 theme that restyles every core LVGL 9 widget in the shadcn/ui style, with light and dark palettes switchable at run time and no_std Rust bindings."
---

# lvgl_theme_shadcn: the shadcn/ui look on LVGL 9

## Overview

`lvgl_theme_shadcn` gives an LVGL interface the look of shadcn/ui with one function call. It styles every core widget, from buttons and sliders to tables, calendars and keyboards, in its default, pressed, checked, focused and disabled states, so applications keep writing plain LVGL code instead of restyling each widget themselves.

It is a C99 library for LVGL 9.6 or newer with no other dependency, plus `no_std` Rust bindings on crates.io. The repository ships CMake, ESP-IDF, Zephyr, PlatformIO and Arduino manifests.

## Technical choices

- **Palettes switchable at run time.** The 9 shadcn/ui base colours combine with 18 accents, in light and dark. Changing the palette restyles existing widgets in place, without rebuilding the screen. A script imports a theme made with the shadcn/ui theme editor, and a full palette can be derived from a single brand colour.
- **Cheap to render.** No shadows, blur or gradients: flat fills and 1 dp borders stay fast on microcontrollers with small draw buffers and RGB565 displays.
- **Touch-first.** Controls are 40 dp tall with 48 dp touch targets, and a visible focus ring supports keypad and encoder navigation. A compact flag tightens everything for small screens.
- **shadcn component roles.** Button variants and sizes, text roles from `h1` to `muted`, and badges, alerts, cards and skeletons are one call on a plain LVGL object. Skeletons stop pulsing when reduced motion is requested.
- **Screenshot tests.** The gallery images in the repository are the references of a screenshot test suite, rendered at 480×320 from the example scenes.

## Explore the project

- [Source code and gallery](https://github.com/AlixANNERAUD/lvgl_theme_shadcn)
- [Rust bindings on crates.io](https://crates.io/crates/lvgl_theme_shadcn)
