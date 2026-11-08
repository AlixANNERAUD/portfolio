---
title: "nanobom : suivi des vulnérabilités des SBOM"
description: "Outil autohébergé de suivi des vulnérabilités des SBOM en un conteneur : envois de la CI confrontés à OSV, failles exploitées en tête, builds risqués bloqués."
---

# nanobom : savoir ce que l’on livre, et ce qui est vraiment exploité

## Présentation

`nanobom` est un outil léger et autohébergé de suivi des vulnérabilités des SBOM. La CI de chaque projet envoie un SBOM CycloneDX ou SPDX ; nanobom confronte chaque composant à [OSV](https://osv.dev) après chaque envoi et chaque nuit, garde l’historique de chaque vulnérabilité, montre celles qui sont réellement exploitées et peut faire échouer le pipeline avant qu’un build vulnérable ne soit livré. Il est publié sous la forme d’un seul conteneur, pour amd64 et arm64, avec un fichier SQLite ou PostgreSQL, sous licence Apache-2.0.

L’analyse de composition logicielle passe d’habitude par une plateforme lourde : OWASP Dependency-Track repose sur une pile Java, un serveur de base de données et un miroir des bases de vulnérabilités. nanobom s’adresse aux petites équipes et aux homelabs qui veulent les réponses sans l’exploitation qui va avec.

## Choix techniques

- **L’exploitation avant la sévérité.** La plupart des vulnérabilités critiques ne sont jamais exploitées, et certaines de sévérité moyenne le sont largement. Les vulnérabilités dotées d’une CVE portent les données du catalogue Known Exploited Vulnerabilities de la CISA (date d’ajout, échéance de correction, usage par des rançongiciels) et leur probabilité EPSS, et sont classées d’abord par exploitation connue, puis par sévérité et par score EPSS.
- **Une vulnérabilité, un suivi, un historique.** Les alias d’une même vulnérabilité (GHSA, CVE, RustSec…) sont fusionnés en un seul suivi, ouvert, corrigé, rouvert ou ignoré avec un motif et une date d’expiration. Le graphe de dépendances du SBOM désigne la dépendance directe à mettre à jour.
- **Un contrôle dans la CI.** Un envoi peut attendre son évaluation et échouer sur les vulnérabilités critiques, élevées ou exploitées. Une GitHub Action dédiée génère le SBOM avec Syft, l’envoie et écrit le résumé dans le job ; toute autre CI n’a besoin que d’un appel `curl`, et les pipelines conçus pour Dependency-Track ne changent que l’adresse et la clé.
- **Un processus, une base de données.** Les analyses sont sérialisées dans le processus et les demandes portant sur le même périmètre sont fusionnées. OSV est interrogé par lots et ses fiches mises en cache : les analyses suivantes ne récupèrent que ce qui a changé. Les données d’exploitation sont rafraîchies avant de répondre aux envois en attente, et les webhooks sont enregistrés avant d’être envoyés : un destinataire lent ou injoignable ne bloque jamais la CI et ne fait perdre aucune notification.
- **L’isolation dans la couche métier.** Chaque opération sur les données d’une organisation, depuis l’interface ou l’API, passe par un même contrôle de permissions, et une organisation dont l’utilisateur n’est pas membre répond « introuvable ». Les jetons d’envoi portent 256 bits aléatoires, sont stockés sous forme d’empreinte et limités à une organisation ou à un projet. L’authentification unique utilise OpenID Connect avec PKCE et reconnaît les utilisateurs par émetteur et identifiant, jamais par adresse e-mail. L’espace de travail interdit le code `unsafe`.
- **S’intègre aux outils existants.** Export et import VEX CycloneDX, webhooks en JSON ou directement vers Slack et Microsoft Teams, métriques Prometheus, sauvegardes à chaud et rôles déduits des groupes du fournisseur d’identité.
- **Une interface qui fonctionne sans JavaScript.** Écrite avec Leptos et rendue côté serveur, en français et en anglais, en thème clair et sombre ; un petit module WebAssembly ajoute l’interactivité quand le navigateur l’exécute. La suite de tests tourne sur SQLite comme sur PostgreSQL.

## Explorer le projet

- [Code source](https://github.com/AlixANNERAUD/nanobom)
- [Documentation : tutoriels, guides pratiques, référence et architecture](https://alixanneraud.github.io/nanobom/)
- [GitHub Action pour la CI](https://github.com/AlixANNERAUD/nanobom-action)
