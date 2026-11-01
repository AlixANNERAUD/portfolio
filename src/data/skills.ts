/** Public, bilingual technical skills grounded in actual portfolio projects. */
import type { ProjectId } from "./projects.ts";
import type { Label, Localized } from "./types.ts";

/**
 * Links to a dedicated EN/FR project page, or to an explicit resource
 * (`href` is an English site path, localized when rendered, or an absolute URL).
 */
export type SkillEvidence = (
  | { kind: "project"; projectId: ProjectId }
  | { kind: "link"; href: string; label: Localized }
) & { detail: Localized };

export interface SkillDomain {
  id: string;
  icon: "cpu" | "database" | "code" | "server" | "shield" | "bot";
  title: Localized;
  description: Localized;
  technologies: readonly Label[];
  examples: readonly SkillEvidence[];
}

export const skillDomains: readonly SkillDomain[] = [
  {
    id: "systems",
    icon: "cpu",
    title: { fr: "Systèmes, Rust et embarqué", en: "Systems, Rust & embedded" },
    description: {
      fr: "Du matériel aux applications : pilotes, abstractions, mémoire, tâches et exécution WebAssembly sur des machines aux ressources limitées.",
      en: "From hardware to applications: drivers, abstractions, memory, tasks and WebAssembly on resource-constrained systems.",
    },
    technologies: ["Rust", "C / C++", "WebAssembly", "ESP32", "LVGL", "Linux"],
    examples: [
      {
        kind: "project",
        projectId: "xila",
        detail: {
          fr: "Noyau, pilotes, VFS et runtime WebAssembly.",
          en: "Kernel, drivers, VFS and WebAssembly runtime.",
        },
      },
      {
        kind: "project",
        projectId: "nanoexpr",
        detail: {
          fr: "Parseur mathématique sans allocation.",
          en: "Allocation-free expression parser.",
        },
      },
      {
        kind: "project",
        projectId: "nanoaudio",
        detail: {
          fr: "Traitement audio et codecs no_std.",
          en: "no_std audio processing and codecs.",
        },
      },
    ],
  },
  {
    id: "backend",
    icon: "database",
    title: {
      fr: "Backend, API et données",
      en: "Backend, APIs & data",
    },
    description: {
      fr: "Conception d’API, intégration de données et pipelines de traitement. J’aime relier le modèle métier à une implémentation simple et maintenable.",
      en: "API design, data integration and processing pipelines. I focus on connecting domain needs to simple, maintainable implementations.",
    },
    technologies: [
      "Python",
      "Django REST",
      "Java",
      "SQL",
      "PostgreSQL",
      "Rust / Actix",
      "NumPy",
    ],
    examples: [
      {
        kind: "project",
        projectId: "deez-nalyzer",
        detail: {
          fr: "API musicale, analyse audio et ML.",
          en: "Music APIs, audio analysis and ML.",
        },
      },
      {
        kind: "project",
        projectId: "dera",
        detail: {
          fr: "Plateforme étudiante en Rust.",
          en: "Student platform built with Rust.",
        },
      },
    ],
  },
  {
    id: "frontend",
    icon: "code",
    title: {
      fr: "Interfaces et applications web",
      en: "Web interfaces & applications",
    },
    description: {
      fr: "Interfaces Vue et React, applications web interactives et extensions navigateur. Le design doit servir l’usage autant que le code.",
      en: "Vue and React interfaces, interactive web applications and browser extensions. Design should serve the user as much as the code.",
    },
    technologies: [
      "Vue 3",
      "TypeScript",
      "JavaScript",
      "React",
      "Vite",
      "WXT",
      "Tailwind CSS",
    ],
    examples: [
      {
        kind: "project",
        projectId: "mini-train-store",
        detail: {
          fr: "Boutique en ligne et extension WXT.",
          en: "Storefront and WXT browser extension.",
        },
      },
      {
        kind: "project",
        projectId: "deez-nalyzer",
        detail: {
          fr: "Exploration et visualisation de données musicales.",
          en: "Interactive exploration of music data.",
        },
      },
    ],
  },
  {
    id: "infrastructure",
    icon: "server",
    title: {
      fr: "Infrastructure et DevOps",
      en: "Infrastructure & DevOps",
    },
    description: {
      fr: "Auto-hébergement, déploiements reproductibles, CI/CD, supervision et maintenance de services utilisés au quotidien.",
      en: "Self-hosting, reproducible deployments, CI/CD, monitoring and maintaining services used every day.",
    },
    technologies: [
      "Debian / Linux",
      "Docker",
      "Ansible",
      "AWS",
      "GitHub Actions",
      "Git",
      { en: "Networking", fr: "Réseaux" },
    ],
    examples: [
      {
        kind: "project",
        projectId: "infrastructure",
        detail: {
          fr: "Services, déploiements Ansible et supervision.",
          en: "Services, Ansible deployments and observability.",
        },
      },
      {
        kind: "project",
        projectId: "mini-train-store",
        detail: {
          fr: "Odoo auto-hébergé pour un usage réel.",
          en: "Self-hosted Odoo for a real business.",
        },
      },
    ],
  },
  {
    id: "security",
    icon: "shield",
    title: {
      fr: "Réseaux et sécurité",
      en: "Networking & security",
    },
    description: {
      fr: "Diagnostic réseau L2/L3, téléphonie IP et cybersécurité. Une pratique nourrie par l’exploitation télécom et les CTF en équipe.",
      en: "L2/L3 network diagnostics, IP telephony and cybersecurity, informed by telecom operations and team-based CTFs.",
    },
    technologies: [
      "L2/L3",
      "MPLS / VPN",
      "SIP",
      "Cisco",
      "Juniper",
      "CTF",
      "Linux",
    ],
    examples: [
      {
        kind: "project",
        projectId: "jeanne-hack-2026",
        detail: {
          fr: "Première place ex æquo en équipe.",
          en: "Joint first place as a team.",
        },
      },
      {
        kind: "link",
        href: "/experiences#professional",
        label: { fr: "Expérience chez Linkt", en: "Linkt experience" },
        detail: {
          fr: "Support réseau, diagnostic et automatisation.",
          en: "Network operations, diagnostics and automation.",
        },
      },
    ],
  },
  {
    id: "agents",
    icon: "bot",
    title: {
      fr: "Outils de développement agentiques",
      en: "Agent-assisted development",
    },
    description: {
      fr: "J’utilise les agents de code pour explorer, implémenter et relire, sans déléguer la validation : tests, revues Git et CI restent essentiels.",
      en: "I use coding agents to explore, implement and review, while keeping validation in the loop through tests, Git reviews and CI.",
    },
    technologies: [
      "OpenCode",
      "Claude Code",
      "Codex",
      "MCP",
      { en: "Testing", fr: "Tests" },
      "Git / CI",
    ],
    examples: [
      {
        kind: "link",
        href: "https://github.com/AlixANNERAUD/Web_site/blob/main/AGENTS.md",
        label: {
          fr: "Instructions multi-agents",
          en: "Shared agent guidelines",
        },
        detail: {
          fr: "Une seule convention pour plusieurs assistants.",
          en: "One shared convention across coding assistants.",
        },
      },
      {
        kind: "project",
        projectId: "xila",
        detail: {
          fr: "Projet Rust avec tests et intégration continue.",
          en: "Rust project with tests and continuous integration.",
        },
      },
    ],
  },
];

export interface SpokenLanguage {
  id: string;
  name: Localized;
  proficiency: Localized;
  detail?: Localized;
}

export const spokenLanguages: readonly SpokenLanguage[] = [
  {
    id: "french",
    name: { fr: "Français", en: "French" },
    proficiency: { fr: "Langue maternelle", en: "Native" },
  },
  {
    id: "english",
    name: { fr: "Anglais", en: "English" },
    proficiency: { fr: "Courant", en: "Fluent" },
    detail: { fr: "TOEIC 975 · C1", en: "TOEIC 975 · C1" },
  },
  {
    id: "spanish",
    name: { fr: "Espagnol", en: "Spanish" },
    proficiency: { fr: "Notions", en: "Basic" },
    detail: { fr: "A2", en: "A2" },
  },
  {
    id: "german",
    name: { fr: "Allemand", en: "German" },
    proficiency: { fr: "Notions", en: "Basic" },
    detail: { fr: "A2", en: "A2" },
  },
];
