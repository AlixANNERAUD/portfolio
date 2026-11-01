/** Single source of truth for project metadata shared by the EN/FR pages. */
import { localizePath, type Locale } from "../i18n/locales.ts";
import type { Technology } from "./technologies.ts";
import type { Localized, Period } from "./types.ts";

export type ProjectCategory =
  | "systems"
  | "software"
  | "web"
  | "infrastructure"
  | "embedded"
  | "security"
  | "data";
export type ProjectGroup = "personal" | "library" | "competition" | "academic";
export type RankFactor =
  "technicalDepth" | "originality" | "practicalImpact" | "evidence";

export interface Project {
  id: string;
  /** A plain string when the title is the same in every locale (proper nouns). */
  title: string | Localized;
  description: Localized;
  period: Period;
  group: ProjectGroup;
  category: ProjectCategory;
  symbol: string;
  tags: readonly Technology[];
  /** Human-reviewed editorial factors, scored 0-5; not external quality metrics. */
  ranking: Record<RankFactor, number>;
  /** Team size, when the project was built by a team. */
  team?: number;
  externalUrl?: string;
}

export const projects = [
  {
    id: "xila",
    title: "Xila",
    description: {
      en: "A lightweight operating system for microcontrollers, combining a Rust kernel, WebAssembly applications and a browser demo.",
      fr: "Un système d’exploitation léger pour microcontrôleurs avec noyau Rust, applications WebAssembly et démonstration dans le navigateur.",
    },
    period: { start: "2019", end: "present" },
    group: "personal",
    category: "systems",
    symbol: "X",
    tags: ["Rust", "WebAssembly"],
    ranking: {
      technicalDepth: 5,
      originality: 5,
      practicalImpact: 4.5,
      evidence: 5,
    },
    externalUrl: "https://www.xila.dev",
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    description: {
      en: "A reproducible self-hosted infrastructure built around Linux, automation and data sovereignty.",
      fr: "Une infrastructure personnelle auto-hébergée, automatisée et orientée souveraineté des données.",
    },
    period: { start: "2020", end: "present" },
    group: "personal",
    category: "infrastructure",
    symbol: "↗",
    tags: ["Docker", "Ansible", "Debian"],
    ranking: {
      technicalDepth: 4.5,
      originality: 4.2,
      practicalImpact: 5,
      evidence: 4.5,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Infrastructure",
  },
  {
    id: "mini-train-store",
    title: "Mini Train Store",
    description: {
      en: "A self-hosted online store and custom browser extension to simplify listings and inventory management.",
      fr: "Une boutique e-commerce auto-hébergée et une extension de navigateur pour simplifier la gestion des annonces et du stock.",
    },
    period: { start: "2026", end: "present" },
    group: "personal",
    category: "web",
    symbol: "M",
    tags: ["Odoo", "Docker", "Vue.js", "Wxt", "Tailwind", "PostgreSQL"],
    ranking: {
      technicalDepth: 4,
      originality: 4,
      practicalImpact: 5,
      evidence: 4.6,
    },
    externalUrl: "https://github.com/AlixANNERAUD/MiniTrainStore",
  },
  {
    id: "model-railway",
    title: { en: "Model railway network", fr: "Réseau ferroviaire miniature" },
    description: {
      en: "Custom electronics for occupancy detection and automated signalling on an H0-scale railway.",
      fr: "Cartes électroniques de détection d’occupation et commande de signalisation pour un réseau H0 numérique.",
    },
    period: { start: "2019", end: "present" },
    group: "personal",
    category: "embedded",
    symbol: "≋",
    tags: ["ESP32", "S88", "DCC", "Électronique"],
    ranking: {
      technicalDepth: 4.2,
      originality: 4.3,
      practicalImpact: 3.7,
      evidence: 3.5,
    },
    externalUrl: "https://github.com/AlixANNERAUD/S88-Wireless-Feedback-System",
  },
  {
    id: "connected-speaker",
    title: { en: "Connected speaker", fr: "Enceinte connectée" },
    description: {
      en: "An ESP32-powered Wi-Fi control interface for a hi-fi amplifier.",
      fr: "Commande Wi-Fi d’un amplificateur hi-fi avec microcontrôleur ESP32 et interface web.",
    },
    period: { start: "2023" },
    group: "personal",
    category: "embedded",
    symbol: "◉",
    tags: ["C++", "JavaScript"],
    ranking: {
      technicalDepth: 3.2,
      originality: 3.3,
      practicalImpact: 3.4,
      evidence: 3.7,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Connected_speaker",
  },
  {
    id: "dera",
    title: "dera.page",
    description: {
      en: "A privacy-focused student services platform with a calendar, messaging and a social network.",
      fr: "Plateforme de services étudiants auto-hébergée, avec agenda, messagerie et réseau social.",
    },
    period: { start: "2022", end: "present" },
    group: "personal",
    category: "web",
    symbol: "d.",
    tags: ["Rust", "Docker"],
    ranking: {
      technicalDepth: 4.2,
      originality: 4.1,
      practicalImpact: 4.3,
      evidence: 3.8,
    },
    externalUrl: "https://dera.page",
  },
  {
    id: "lvgl-theme-shadcn",
    title: "lvgl_theme_shadcn",
    description: {
      en: "A shadcn/ui-inspired LVGL 9 theme: widget styling, light/dark palettes and customizable embedded interfaces.",
      fr: "Un thème inspiré de shadcn/ui pour LVGL 9 : widgets, palettes claires/sombres et personnalisation sur microcontrôleurs.",
    },
    period: { start: "2026", end: "present" },
    group: "library",
    category: "embedded",
    symbol: "UI",
    tags: ["C99", "LVGL", "Rust", "UI"],
    ranking: {
      technicalDepth: 3.9,
      originality: 4.1,
      practicalImpact: 3.5,
      evidence: 4.1,
    },
    externalUrl: "https://github.com/AlixANNERAUD/lvgl_theme_shadcn",
  },
  {
    id: "nanoexpr",
    title: "nanoexpr",
    description: {
      en: "Heap-free mathematical expression parser and evaluator for embedded Rust with bounded stack usage.",
      fr: "Parseur et évaluateur d’expressions mathématiques pour Rust embarqué, sans allocation dynamique et avec taille de pile bornée.",
    },
    period: { start: "2026", end: "present" },
    group: "library",
    category: "systems",
    symbol: "ƒ",
    tags: ["Rust", "no_std", "Parser", "C ABI"],
    ranking: {
      technicalDepth: 4.7,
      originality: 4.4,
      practicalImpact: 3.4,
      evidence: 4.8,
    },
    externalUrl: "https://github.com/AlixANNERAUD/nanoexpr",
  },
  {
    id: "nanoaudio",
    title: "nanoaudio",
    description: {
      en: "Allocation-free embedded audio processing: PCM conversion, mixing, ring buffers and codecs using caller-owned memory.",
      fr: "Bibliothèque audio embarquée sans allocation : traitement PCM, mixage, buffers circulaires et codecs avec buffers fournis par l’appelant.",
    },
    period: { start: "2026", end: "present" },
    group: "library",
    category: "embedded",
    symbol: "♫",
    tags: ["Rust", "no_std", "Audio", "DSP"],
    ranking: {
      technicalDepth: 4.6,
      originality: 4.3,
      practicalImpact: 3.3,
      evidence: 4.5,
    },
    externalUrl: "https://github.com/AlixANNERAUD/nanoaudio",
  },
  {
    id: "embedded-i18n",
    title: "embedded-i18n",
    description: {
      en: "Compile-time localization for embedded Rust: translations stored in firmware, compile-time checks and allocator-free operation.",
      fr: "Internationalisation compilée dans le firmware Rust : traductions en ROM, validation à la compilation et fonctionnement sans allocateur.",
    },
    period: { start: "2026", end: "present" },
    group: "library",
    category: "embedded",
    symbol: "文",
    tags: ["Rust", "Macros", "no_std", "i18n"],
    ranking: {
      technicalDepth: 4.3,
      originality: 4,
      practicalImpact: 3.2,
      evidence: 4.2,
    },
    externalUrl: "https://github.com/AlixANNERAUD/embedded-i18n",
  },
  {
    id: "getargs-derive",
    title: "getargs-derive",
    description: {
      en: "Procedural macros for embedded Rust command-line interfaces, with allocation-free parsing and compile-time help generation.",
      fr: "Macros procédurales pour décrire des interfaces CLI en Rust embarqué, avec analyse sans allocation et aide générée à la compilation.",
    },
    period: { start: "2026", end: "present" },
    group: "library",
    category: "systems",
    symbol: ">_",
    tags: ["Rust", "Proc macros", "CLI", "no_std"],
    ranking: {
      technicalDepth: 4.1,
      originality: 3.8,
      practicalImpact: 3,
      evidence: 4.3,
    },
    externalUrl: "https://github.com/AlixANNERAUD/getargs-derive",
  },
  {
    id: "battery-percent",
    title: "battery-percent",
    description: {
      en: "Battery state-of-charge estimation from discharge curves and interpolation, with ADC filtering, in C99 and no_std Rust.",
      fr: "Estimation de charge par courbes de décharge et interpolation, avec filtrage ADC : bibliothèque C99 et bindings Rust no_std.",
    },
    period: { start: "2026", end: "present" },
    group: "library",
    category: "embedded",
    symbol: "▰",
    tags: ["C99", "Rust", "Battery", "MCU"],
    ranking: {
      technicalDepth: 3.7,
      originality: 3.9,
      practicalImpact: 3,
      evidence: 4.2,
    },
    externalUrl: "https://github.com/AlixANNERAUD/battery-percent",
  },
  {
    id: "jeanne-hack-2026",
    title: {
      en: "Jeanne d'Hack CTF (University of Rouen)",
      fr: "Jeanne d’Hack CTF (Université de Rouen)",
    },
    description: {
      en: "Joint first place in the overall ranking of the 2026 Jeanne d'Hack CTF.",
      fr: "Première place ex æquo au classement général du CTF Jeanne d’Hack 2026.",
    },
    period: { start: "2026" },
    group: "competition",
    category: "security",
    symbol: "#1",
    tags: ["CTF"],
    ranking: {
      technicalDepth: 3,
      originality: 3.7,
      practicalImpact: 4.5,
      evidence: 5,
    },
    externalUrl: "https://www.jeanne-hack-ctf.org/post/2026/",
  },
  {
    id: "codinsa-2025",
    title: "Cod’INSA",
    description: {
      en: "First place in the 2025 Cod'INSA competitive programming contest.",
      fr: "Première place au concours de programmation compétitive Cod’INSA 2025.",
    },
    period: { start: "2025" },
    group: "competition",
    category: "systems",
    symbol: "</>",
    tags: ["Algorithmique"],
    ranking: {
      technicalDepth: 3.2,
      originality: 3.4,
      practicalImpact: 4.2,
      evidence: 4.5,
    },
    externalUrl: "https://codinsa.org/static/past",
  },
  {
    id: "jeanne-hack-2025",
    title: {
      en: "Jeanne d'Hack CTF (University of Rouen)",
      fr: "Jeanne d’Hack CTF (Université de Rouen)",
    },
    description: {
      en: "Third place in the overall ranking of the 2025 Jeanne d'Hack CTF.",
      fr: "Troisième place au classement général du CTF Jeanne d’Hack 2025.",
    },
    period: { start: "2025" },
    group: "competition",
    category: "security",
    symbol: "#3",
    tags: ["CTF"],
    ranking: {
      technicalDepth: 3,
      originality: 3.2,
      practicalImpact: 3.4,
      evidence: 4,
    },
    externalUrl: "https://www.jeanne-hack-ctf.org/post/2025/",
  },
  {
    id: "tracs-2024",
    title: "TRACS (DGSE)",
    description: {
      en: "Participated in the DGSE TRACS challenge, placing 36th in the student ranking.",
      fr: "Participation au challenge TRACS de la DGSE, avec une 36e place au classement étudiant.",
    },
    period: { start: "2024" },
    group: "competition",
    category: "security",
    symbol: "36",
    tags: ["CTF"],
    ranking: {
      technicalDepth: 2.8,
      originality: 3.2,
      practicalImpact: 3,
      evidence: 3.8,
    },
    externalUrl:
      "https://tracs.viarezo.fr/edition_results/show_student_ranking/2024/",
  },
  {
    id: "deez-nalyzer",
    title: "Deez’Nalyzer",
    description: {
      en: "A Django/Vue application using audio analysis and machine learning to classify music genres.",
      fr: "Application Django/Vue utilisant l’analyse audio et l’apprentissage automatique pour classifier des genres musicaux.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "data",
    symbol: "∿",
    tags: ["Django", "Vue.js", "ML"],
    ranking: {
      technicalDepth: 4.4,
      originality: 3.9,
      practicalImpact: 3.7,
      evidence: 4.8,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Deez_Nalyzer",
  },
  {
    id: "eogm",
    title: {
      en: "Evidential Occupancy Grid Map (EOGM)",
      fr: "Cartographie d’occupation évidentielle (EOGM)",
    },
    description: {
      en: "Robotic occupancy mapping from onboard sensors, using Dempster-Shafer evidence theory.",
      fr: "Cartographie d’occupation robotique à partir de capteurs embarqués, basée sur la théorie de Dempster-Shafer.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "embedded",
    symbol: "▦",
    tags: ["C++", "ROS"],
    ranking: {
      technicalDepth: 4.4,
      originality: 4.2,
      practicalImpact: 3.4,
      evidence: 3,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Evidential_occupancy_map",
  },
  {
    id: "iti-adventure",
    title: { en: "ITI Adventure", fr: "ITI Aventure" },
    description: {
      en: "A text-based Java RPG exploring object-oriented design and software patterns.",
      fr: "Jeu de rôle textuel Java appliquant programmation objet et patrons de conception.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "software",
    symbol: "{ }",
    tags: ["Java"],
    ranking: {
      technicalDepth: 2.8,
      originality: 2.7,
      practicalImpact: 2.2,
      evidence: 2.8,
    },
    externalUrl: "https://github.com/AlixANNERAUD/ITI_aventure",
  },
  {
    id: "huffman",
    title: {
      en: "Huffman (de)compressor",
      fr: "Compresseur/décompresseur Huffman",
    },
    description: {
      en: "A Huffman compressor/decompressor written in C with bitstream processing.",
      fr: "Compresseur/décompresseur Huffman écrit en C, avec manipulation des flux de bits.",
    },
    period: { start: "2023" },
    group: "academic",
    category: "systems",
    symbol: "01",
    tags: ["C"],
    ranking: {
      technicalDepth: 3.3,
      originality: 2.8,
      practicalImpact: 2.5,
      evidence: 3.7,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Huffman_compressor",
  },
  {
    id: "robot-mouche",
    title: "Robot mouche",
    description: {
      en: "A C++ robot combining Wi-Fi remote control, line following and obstacle avoidance.",
      fr: "Robot C++ pilotable en Wi-Fi ou autonome avec suivi de ligne et détection d’obstacles.",
    },
    period: { start: "2023" },
    group: "academic",
    category: "embedded",
    symbol: "⚙",
    tags: ["C++"],
    ranking: {
      technicalDepth: 3.2,
      originality: 3,
      practicalImpact: 2.7,
      evidence: 3.3,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Robot_Mouche",
  },
  {
    id: "music-danceability",
    title: {
      en: "Music danceability",
      fr: "Prédiction de la dansabilité musicale",
    },
    description: {
      en: "Machine-learning experiments predicting song danceability from Spotify audio features.",
      fr: "Expérimentation en machine learning pour prédire la dansabilité d’un titre à partir de données Spotify.",
    },
    period: { start: "2023" },
    group: "academic",
    category: "data",
    symbol: "♪",
    tags: ["Python"],
    ranking: {
      technicalDepth: 2.9,
      originality: 2.7,
      practicalImpact: 2.4,
      evidence: 3,
    },
    externalUrl:
      "https://github.com/AlixANNERAUD/Music_danceability_prediction",
  },
  {
    id: "insatram",
    title: "INSAtram",
    description: {
      en: "A Free Pascal/SDL tram network management and passenger-flow simulation game.",
      fr: "Jeu Free Pascal/SDL de gestion de réseau de tramway et de simulation de voyageurs.",
    },
    period: { start: "2022" },
    group: "academic",
    category: "software",
    symbol: "T",
    tags: ["Free pascal"],
    ranking: {
      technicalDepth: 3.2,
      originality: 3.4,
      practicalImpact: 2.5,
      evidence: 2.7,
    },
    externalUrl: "https://github.com/AlixANNERAUD/INSAtram",
  },
  {
    id: "linear-equations",
    title: {
      en: "System of linear equations calculator",
      fr: "Solveur de systèmes d’équations linéaires",
    },
    description: {
      en: "A C implementation of Gaussian elimination with partial pivoting for linear systems.",
      fr: "Résolution de systèmes linéaires en C par élimination de Gauss avec pivot partiel.",
    },
    period: { start: "2022" },
    group: "academic",
    category: "data",
    symbol: "Σ",
    tags: ["C", "Algèbre linéaire"],
    ranking: {
      technicalDepth: 2,
      originality: 2.2,
      practicalImpact: 2.2,
      evidence: 3.1,
    },
    externalUrl:
      "https://github.com/AlixANNERAUD/System_of_linear_equations_solver",
  },
  {
    id: "odor-localization",
    title: {
      en: "Gas source localization",
      fr: "Localisation de sources de gaz",
    },
    description: {
      en: "ESP32/MQ sensor acquisition and MQTT pipeline prototype for exploring gas source localization during a research internship.",
      fr: "Prototype de collecte de mesures de capteurs MQ via ESP32 et MQTT pour explorer la localisation de sources de gaz lors d’un stage de recherche.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "embedded",
    symbol: "◎",
    tags: ["ESP32", "MQTT", "Capteurs", "Recherche"],
    ranking: {
      technicalDepth: 4.1,
      originality: 4,
      practicalImpact: 3.4,
      evidence: 3,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Odor_localization",
  },
  {
    id: "medical-image-deep-learning",
    title: {
      en: "Medical image segmentation",
      fr: "Segmentation d’images médicales",
    },
    description: {
      en: "Histopathology tissue and cell segmentation/classification experiments using nnU-Net, CellViT++ and HoVer-Net.",
      fr: "Expérimentation de segmentation et classification de tissus et cellules histopathologiques avec nnU-Net, CellViT++ et HoVer-Net.",
    },
    period: { start: "2025" },
    group: "academic",
    category: "data",
    symbol: "▤",
    tags: ["Python", "Deep Learning", "nnU-Net", "CellViT"],
    ranking: {
      technicalDepth: 4,
      originality: 3,
      practicalImpact: 3.3,
      evidence: 3.6,
    },
    externalUrl: "https://github.com/AlixANNERAUD/Deep_learning_project",
  },
] as const satisfies readonly Project[];

/** A project from the catalogue, with its literal `id`. */
export type CatalogueProject = (typeof projects)[number];
export type ProjectId = CatalogueProject["id"];

/** Narrows a route parameter or other string to a known project id. */
export function isProjectId(id: string | undefined): id is ProjectId {
  return projects.some((project) => project.id === id);
}

/** The project with this id; throws on an unknown id. */
export function getProject(id: ProjectId): CatalogueProject {
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return project;
}

/** Portfolio editorial priorities (percent). Not universal project quality scores. */
export const RANK_WEIGHTS: Record<RankFactor, number> = {
  technicalDepth: 40,
  originality: 20,
  practicalImpact: 25,
  evidence: 15,
};

const rankFactors = Object.keys(RANK_WEIGHTS) as RankFactor[];

/** Normalized 0-100 editorial relevance, higher first. */
export function projectScore(project: Project): number {
  const weighted = rankFactors.reduce(
    (sum, factor) => sum + project.ranking[factor] * RANK_WEIGHTS[factor],
    0,
  );
  return Math.round((weighted / 5) * 10) / 10;
}

/** Highest score first; equal scores are ordered by id. */
export function byScore(a: Project, b: Project): number {
  return projectScore(b) - projectScore(a) || a.id.localeCompare(b.id);
}

const ranked: readonly CatalogueProject[] = [...projects].sort(byScore);

/** Stable 1-based relevance rank, shown on cards whatever the filter or sort. */
export function projectRank(id: ProjectId): number {
  const index = ranked.findIndex((project) => project.id === id);
  if (index < 0) throw new Error(`Unknown project: ${id}`);
  return index + 1;
}

/** The three highest-ranked projects, shown on the homepage. */
export const featuredProjects: readonly CatalogueProject[] = ranked.slice(0, 3);

export function projectUrl(id: ProjectId, lang: Locale): string {
  return localizePath(`/projects/${id}`, lang);
}

/**
 * Up to `n` projects that share the category or at least one tag: same
 * category first, then most shared tags, then score. Unrelated projects are
 * never used as padding, so the list can be shorter than `n`.
 */
export function relatedProjects(id: ProjectId, n = 3): CatalogueProject[] {
  const current = getProject(id);
  const tags = new Set<string>(current.tags);
  const shared = (project: Project) =>
    project.tags.filter((tag) => tags.has(tag)).length;
  const sameCategory = (project: Project) =>
    project.category === current.category;
  return projects
    .filter(
      (project) =>
        project.id !== id && (sameCategory(project) || shared(project) > 0),
    )
    .sort(
      (a, b) =>
        Number(sameCategory(b)) - Number(sameCategory(a)) ||
        shared(b) - shared(a) ||
        byScore(a, b),
    )
    .slice(0, n);
}

/**
 * The project after `id` in relevance order, wrapping around, that is not in
 * `skip` (e.g. the related projects already listed on the page).
 */
export function nextProject(
  id: ProjectId,
  skip: readonly ProjectId[] = [],
): CatalogueProject {
  const start = projectRank(id);
  for (let step = 0; step < ranked.length - 1; step++) {
    const candidate = ranked[(start + step) % ranked.length];
    if (!skip.includes(candidate.id)) return candidate;
  }
  throw new Error(`No next project for ${id}`);
}
