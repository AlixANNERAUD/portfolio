---
title: "Direct and iterative linear solvers in C"
description: "Seven ways to solve a linear system in plain C, from triangular substitution and Gaussian elimination to LU, Cholesky, Jacobi and Gauss-Seidel methods."
---

# Direct and iterative solvers for linear systems in C

## Overview

As part of a mathematics course, in 2022, our team of three implemented several methods to solve a linear system AX = B in plain C, without any numerical library. The program runs each method on a small example system and prints the solution.

## Technical choices

- **Direct methods.** Forward and back substitution solve triangular systems. Gaussian elimination reduces the matrix to an upper triangular form, LU factorization keeps the elimination multipliers in a lower triangular matrix L, and Cholesky factorization writes a symmetric positive-definite matrix as L·Lᵀ.
- **Iterative methods.** The Jacobi and Gauss-Seidel methods start from a vector of ones and stop when the Euclidean norm of the change between two iterations falls below 0.001, or after 10 iterations.
- **Plain C.** Matrices are dynamically allocated arrays of rows, and the code depends only on the C standard library.
- **No pivoting.** Elimination divides by each diagonal coefficient as it is, so the code assumes nonzero pivots. It is a course exercise, not a general-purpose library.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/system_of_linear_equations_solver): C program, build scripts and report (in French).
