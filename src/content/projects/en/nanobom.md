---
title: "nanobom: SBOM vulnerability tracking in Rust"
description: "A self-hosted SBOM vulnerability tracker in one container: CI uploads matched against OSV, exploited vulnerabilities flagged first, risky builds stopped."
---

# nanobom: know what you ship, and what is actually exploited

## Overview

`nanobom` is a lightweight, self-hosted SBOM vulnerability tracker. Each project's CI uploads a CycloneDX or SPDX SBOM; nanobom checks every component against [OSV](https://osv.dev) after each upload and every night, keeps the history of each vulnerability, shows which ones are actually exploited, and can fail the pipeline before a vulnerable build ships. It is published as one container, for amd64 and arm64, with a SQLite file or PostgreSQL, under the Apache-2.0 license.

Software composition analysis usually means a heavy platform: OWASP Dependency-Track runs on a Java stack with a database server and a mirror of the vulnerability databases. nanobom is for small teams and homelabs that want the answers without the operations.

## Technical choices

- **Exploitation before severity.** Most critical vulnerabilities are never exploited, and some medium ones are exploited widely. Findings with a CVE carry the CISA Known Exploited Vulnerabilities catalog (date added, remediation due date, ransomware use) and their EPSS probability, and are listed known-exploited first, then by severity and EPSS score.
- **One finding per vulnerability, with its history.** The aliases of one vulnerability (GHSA, CVE, RustSec…) merge into a single finding, opened, fixed, reopened or ignored with a reason and an expiry date. The SBOM's dependency graph names the direct dependency to upgrade.
- **A gate in CI.** An upload can wait for its evaluation and fail on critical, high or known-exploited findings. A companion GitHub Action generates the SBOM with Syft, uploads it and writes the summary to the job; any other CI needs one `curl` call, and pipelines built for Dependency-Track only change the address and key.
- **One process, one database.** Runs are serialized in the process and requests for the same scope are merged. OSV is queried in batches and its records cached, so later runs only fetch what changed. Exploitation data is refreshed before waiting uploads are answered, and webhooks are stored before they are sent, so a slow or unreachable receiver never holds CI back nor loses a notification.
- **Isolation in the domain layer.** Every operation on an organization's data, from the interface or the API, goes through one permission check, and organizations a user does not belong to answer "not found". Upload tokens carry 256 random bits, are stored as digests and are scoped to an organization or a project. Single sign-on uses OpenID Connect with PKCE and matches users by issuer and subject, never by email address. The workspace forbids `unsafe` code.
- **Fits the tools around it.** CycloneDX VEX export and import, webhooks as JSON or straight to Slack and Microsoft Teams, Prometheus metrics, online backups, and roles mapped from identity provider groups.
- **An interface that works without JavaScript.** Written with Leptos and rendered on the server, in English and French, light and dark; a small WebAssembly bundle adds interactivity where the browser runs it. The test suite runs on both SQLite and PostgreSQL.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/nanobom)
- [Documentation: tutorials, how-to guides, reference and architecture](https://alixanneraud.github.io/nanobom/)
- [GitHub Action for CI](https://github.com/AlixANNERAUD/nanobom-action)
