---
title: "Solveurs linéaires directs et itératifs en C"
description: "Sept façons de résoudre un système linéaire en C pur : substitution triangulaire, élimination de Gauss, LU, Cholesky, Jacobi et Gauss-Seidel."
---

# Méthodes directes et itératives pour les systèmes linéaires en C

## Présentation

Dans le cadre d’un cours de mathématiques, en 2022, notre équipe de trois a programmé plusieurs méthodes de résolution d’un système linéaire AX = B en C pur, sans bibliothèque de calcul numérique. Le programme applique chaque méthode à un petit système d’exemple et affiche la solution.

## Choix techniques

- **Des méthodes directes.** Les substitutions avant et arrière résolvent les systèmes triangulaires. L’élimination de Gauss ramène la matrice à une forme triangulaire supérieure, la factorisation LU conserve les multiplicateurs de l’élimination dans une matrice triangulaire inférieure L, et la factorisation de Cholesky écrit une matrice symétrique définie positive sous la forme L·Lᵀ.
- **Des méthodes itératives.** Les méthodes de Jacobi et de Gauss-Seidel partent d’un vecteur de uns et s’arrêtent quand la norme euclidienne de l’écart entre deux itérations passe sous 0,001, ou après 10 itérations.
- **Du C pur.** Les matrices sont des tableaux de lignes alloués dynamiquement, et le code ne dépend que de la bibliothèque standard du C.
- **Sans pivotement.** L’élimination divise par chaque coefficient diagonal tel quel : le code suppose des pivots non nuls. C’est un exercice de cours, pas une bibliothèque généraliste.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/system_of_linear_equations_solver) : programme C, scripts de compilation et rapport.
