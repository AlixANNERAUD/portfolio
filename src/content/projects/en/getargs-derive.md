---
title: "getargs-derive: Clap-style CLI for no_std"
description: "Rust derive macros that turn a struct into a Clap-style command-line parser for no_std targets, with no allocation and help text built at compile time."
---

# getargs-derive: Clap-style argument parsing for no_std

## Overview

`getargs-derive` describes a command-line interface as a Rust struct and generates its parser, in the style of Clap's derive API. Clap requires `std`; this crate targets `no_std`, so the same code runs on a microcontroller reading arguments from a serial console, in a kernel or in a regular binary. The generated parser is built on the `getargs` crate, and both are published on crates.io.

## Technical choices

- **No allocation by default.** Parsed values and errors borrow the arguments, and repeated values fit in fixed-capacity collections. `heapless` or `Vec` storage is available as an option.
- **Help computed at compile time.** `--help`, `--version` and the help of every subcommand are `&'static str` constants built by the macro, so no help-formatting code ends up in the binary.
- **Familiar attributes, checked by the compiler.** Doc comments become help text, and subcommands, value enums, defaults, aliases, argument relations and groups use Clap's attribute names. Unsupported Clap attributes are rejected at compile time rather than silently ignored.
- **The program decides.** The parser never prints or exits on its own: it returns the struct or an error, with Clap-style messages and "did you mean" suggestions for misspelled options.
- **Extras with `std`.** Bash, zsh and fish completion scripts and a man page are generated from the same struct.

It implements a subset of Clap's derive API and is not a drop-in replacement: there is no builder API and no colored output.

## Explore the project

- [Source code and guide](https://github.com/AlixANNERAUD/getargs_derive)
- [API documentation on docs.rs](https://docs.rs/getargs-derive)
