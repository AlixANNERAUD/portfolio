---
title: "embedded-i18n: compile-time i18n for Rust"
description: "A localization library for no_std Rust firmware: translations are compiled into flash as plain strings, and a missing translation fails the build."
---

# embedded-i18n: translations resolved at compile time

## Overview

`embedded-i18n` translates the strings of a Rust firmware at build time. Translations from JSON, YAML, TOML, gettext PO and MO, or Fluent files become plain `&'static str` literals stored in flash. There is no runtime parser, no allocator, no file system and no heap, and the firmware only contains the strings it uses, in the language it is built for. The crate is published on crates.io.

## Technical choices

- **Compile errors instead of blank screens.** Missing keys, missing plural forms, invalid locale files and format placeholders that do not match their arguments are reported at the call site. An optional strict mode forbids falling back to another language.
- **The formats translators already use.** Every locale format is parsed by the procedural macros, so supporting one adds no code and no dependency to the firmware.
- **Real-world linguistics.** CLDR plural rules for 40 languages, gettext `Plural-Forms`, message context, select variants such as gender, fallback chains like `fr-CA` → `fr` → `en`, right-to-left isolation and localized dates without `libc`.
- **Formatting without allocation.** Translated messages are written to any `core::fmt::Write` target, such as a display driver, with placeholders checked at compile time in every language.
- **Runtime switching when needed.** Several locales can be embedded and switched with a single atomic, still without allocation.

The set of languages has to be known at build time. For applications that download language packs, a runtime library such as Fluent remains the better fit.

## Explore the project

- [Source code and guide](https://github.com/AlixANNERAUD/embedded_i18n)
- [API documentation on docs.rs](https://docs.rs/embedded-i18n)
