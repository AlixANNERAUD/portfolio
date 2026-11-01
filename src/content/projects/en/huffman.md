---
title: "Huffman coding: a file compressor in C"
description: "A command-line Huffman compressor in C, built by a team of four at INSA Rouen Normandie, with its own file header, CUnit unit tests and round-trip tests."
---

# Huffman coding: a lossless file compressor in C

## Overview

This compressor was a group project for the "Advanced algorithmic and C programming" course at INSA Rouen Normandie, in 2023. Our team of four implemented Huffman coding in C, from counting the bytes of a file to writing and reading back a compressed bit stream.

The program has two commands: `huffman c FILE` compresses a file into `FILE.huff`, and `huffman d FILE.huff` restores the original.

## Technical choices

- **Byte counts in the header.** The compressor counts how often each of the 256 byte values occurs, builds the Huffman tree from these counts with a priority queue, then derives a coding table from the tree. The compressed file starts with a `HUFF` identifier followed by the counts, so the decompressor rebuilds the same tree instead of reading a stored one.
- **Bit-level output.** Variable-length codes are packed into bytes as they are produced, and the last, incomplete byte is written at the end.
- **Edge cases handled.** An empty file, or a file made of a single repeated byte, is stored as a header only, since a Huffman tree needs at least two symbols.
- **Checked decompression.** After decompressing, the program counts the bytes of the result again and compares them with the header, so a corrupted file is reported instead of passing silently.
- **One module per data structure.** Bits, bytes, binary codes, the priority queue, the Huffman tree, the coding table and the statistics each have their own C module, documented with Doxygen.
- **Two levels of tests.** CUnit unit tests cover each module. A Python script compresses and decompresses generated files (empty, a single byte, Lorem ipsum, random, balanced and unbalanced content) and compares their SHA-256 hashes and sizes.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/huffman_compressor): C sources, makefile, tests and the LaTeX report (in French).
