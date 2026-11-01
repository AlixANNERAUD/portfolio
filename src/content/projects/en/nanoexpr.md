---
title: "nanoexpr: heap-free math expression parser"
description: "A no_std Rust library with C bindings that parses and evaluates math formulas typed at run time on a microcontroller, without any heap allocation."
---

# nanoexpr: evaluating math formulas without a heap

## Overview

`nanoexpr` parses and evaluates math formulas typed at run time, such as `raw * 0.0125 - 40`, on a microcontroller and without a heap. It is a `no_std` Rust crate published on crates.io, with C and C++ bindings built through CMake.

Letting a user type a formula is common: a calculator app, a sensor conversion set in the field, an alarm threshold stored in a configuration file. Most expression crates are built for desktops. They need `std`, allocate a syntax tree on every call and turn bad input into `NaN` or a panic, which on a microcontroller means heap fragmentation, unpredictable memory use and crashes.

## Technical choices

- **Evaluation during parsing.** There is no syntax tree and no token buffer: the result is computed while the text is read. A test with a counting allocator checks that nothing is allocated.
- **Bounded stack.** Nesting is limited to 32 levels by default, so hostile input cannot overflow the stack, and call arguments live in a fixed-size array. The evaluator and the C bindings are fuzzed with `cargo-fuzz`.
- **Any number type.** `f32`, `f64`, integers that report overflow instead of wrapping, or a custom type through a trait. Optional `Decimal` and `Fraction` types compute like a pocket calculator, so `0.1 + 0.2` is exactly `0.3`.
- **Errors meant to be shown.** Each error carries a kind and the byte span of the faulty input. Division by zero and domain errors are reported, never turned into a silent `NaN`.
- **Variables and functions from the application.** The evaluator asks a context for each name it meets. A formula can also be compiled once into a buffer provided by the caller, then evaluated again with new values, still without allocation.

## Explore the project

- [Source code, syntax and benchmarks](https://github.com/AlixANNERAUD/nanoexpr)
- [API documentation on docs.rs](https://docs.rs/nanoexpr)
