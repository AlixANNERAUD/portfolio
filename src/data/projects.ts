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
  /** Main link: the project's site, demo or repository. */
  externalUrl?: string;
  /** Public source repository, when `externalUrl` is not already one. */
  repositoryUrl?: string;
}

/** Hosts whose links point at source code. */
export const codeHosts: ReadonlySet<string> = new Set([
  "github.com",
  "gitlab.com",
  "codeberg.org",
]);

/** The project's main link, typed for entries that have none. */
export function projectExternalUrl(project: Project): string | undefined {
  return project.externalUrl;
}

/** Public source repository: `repositoryUrl`, else a code-host `externalUrl`. */
export function projectRepository(project: Project): string | undefined {
  if (project.repositoryUrl) return project.repositoryUrl;
  const url = project.externalUrl;
  return url !== undefined && codeHosts.has(new URL(url).hostname)
    ? url
    : undefined;
}

export const projects = [
  {
    id: "xila",
    title: "Xila",
    description: {
      en: "A modular Rust operating system for microcontrollers, running WebAssembly apps on Wasmi with an LVGL interface and a browser demo.",
      fr: "Un OS Rust modulaire pour microcontrôleurs, qui exécute des applications WebAssembly sur Wasmi avec une interface LVGL et une démo web.",
    },
    period: { start: "2019", end: "present" },
    group: "personal",
    category: "systems",
    symbol: "X",
    tags: ["Rust", "WebAssembly", "LVGL"],
    ranking: {
      technicalDepth: 5,
      originality: 5,
      practicalImpact: 4.5,
      evidence: 5,
    },
    externalUrl: "https://www.xila.dev",
    repositoryUrl: "https://github.com/xila-project/core",
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    description: {
      en: "Self-hosted services on a TrueNAS server and a VPS, deployed with Ansible and Docker Compose and monitored with Grafana.",
      fr: "Des services auto-hébergés sur un serveur TrueNAS et un VPS, déployés avec Ansible et Docker Compose, et supervisés avec Grafana.",
    },
    period: { start: "2020", end: "present" },
    group: "personal",
    category: "infrastructure",
    symbol: "↗",
    tags: ["Docker", "Ansible", "TrueNAS", "Debian"],
    ranking: {
      technicalDepth: 4.5,
      originality: 4.2,
      practicalImpact: 5,
      evidence: 4.5,
    },
    externalUrl: "https://github.com/AlixANNERAUD/infrastructure",
  },
  {
    id: "mini-train-store",
    title: "Mini Train Store",
    description: {
      en: "A self-hosted Odoo shop for a family model railway business, and a browser extension that collects its Leboncoin listings.",
      fr: "Une boutique Odoo auto-hébergée pour un commerce familial de trains miniatures, et une extension qui collecte ses annonces Leboncoin.",
    },
    period: { start: "2025", end: "present" },
    group: "personal",
    category: "web",
    symbol: "M",
    tags: ["Odoo", "Docker", "Vue.js", "WXT", "Tailwind", "PostgreSQL"],
    ranking: {
      technicalDepth: 4,
      originality: 4,
      practicalImpact: 5,
      evidence: 4.6,
    },
    externalUrl: "https://github.com/AlixANNERAUD/mini_train_store",
  },
  {
    id: "model-railway",
    title: { en: "Model railway network", fr: "Réseau ferroviaire miniature" },
    description: {
      en: "Electronics for a digital HO model railway, including ESP32 modules that detect occupied blocks by current and report them over Wi-Fi to a gateway that feeds the S88 bus.",
      fr: "L’électronique d’un réseau miniature numérique H0, dont des modules ESP32 qui détectent les cantons occupés en mesurant le courant et les signalent sans fil au bus S88.",
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
    externalUrl: "https://github.com/AlixANNERAUD/s88_wireless_feedback_system",
  },
  {
    id: "connected-speaker",
    title: { en: "Connected speaker", fr: "Enceinte connectée" },
    description: {
      en: "An ESP32 that controls a hi-fi amplifier over Wi-Fi or with learned infrared remotes, from a web interface served by the board itself.",
      fr: "Un ESP32 qui commande un amplificateur hi-fi en Wi-Fi ou par des télécommandes infrarouges dont il apprend les codes, depuis une interface web servie par la carte.",
    },
    period: { start: "2023" },
    group: "personal",
    category: "embedded",
    symbol: "◉",
    tags: ["ESP32", "C++", "JavaScript"],
    ranking: {
      technicalDepth: 3.2,
      originality: 3.3,
      practicalImpact: 3.4,
      evidence: 3.7,
    },
    externalUrl: "https://github.com/AlixANNERAUD/connected_speaker",
  },
  {
    id: "covid3d",
    title: "Covid3D",
    description: {
      en: "About 1,000 face shields 3D-printed during the first 2020 lockdown, with custom G-code that printed and ejected stacks of frames.",
      fr: "Environ 1 000 visières imprimées en 3D pendant le premier confinement de 2020, avec un G-code sur mesure qui imprimait les armatures par piles.",
    },
    period: { start: "2020" },
    group: "personal",
    category: "embedded",
    symbol: "3D",
    tags: ["3D printing", "G-code"],
    ranking: {
      technicalDepth: 2.5,
      originality: 3.5,
      practicalImpact: 4,
      evidence: 2,
    },
  },
  {
    id: "dera",
    title: "dera.page",
    description: {
      en: "A self-hosted Rust platform for INSA Rouen Normandie students, with a calendar, instant messaging and a social network, built with privacy in mind.",
      fr: "Une plateforme Rust auto-hébergée pour les étudiants de l’INSA Rouen Normandie, avec agenda, messagerie instantanée et réseau social, respectueuse de la vie privée.",
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
      en: "A C99 theme that gives every core LVGL 9 widget the shadcn/ui look, with light and dark palettes switchable at run time.",
      fr: "Un thème C99 qui donne à chaque widget de base de LVGL 9 le style shadcn/ui, avec des palettes claires et sombres modifiables à l’exécution.",
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
      en: "A no_std Rust and C library that parses and evaluates math formulas at run time, with no heap allocation and a bounded stack.",
      fr: "Une bibliothèque Rust et C no_std qui analyse et évalue des formules mathématiques à l’exécution, sans allocation et avec une pile bornée.",
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
      en: "Allocation-free no_std Rust audio: PCM conversion, mixing, single-pass pipelines, a DMA ring buffer and decoders.",
      fr: "Audio Rust no_std sans allocation : conversion PCM, mixage, chaînes de traitement en une passe, tampon circulaire pour le DMA et décodeurs.",
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
      en: "Compile-time translations for no_std Rust firmware, stored in flash as plain strings, with missing keys caught at build time.",
      fr: "Des traductions compilées pour micrologiciel Rust no_std, stockées en mémoire flash, et qui détecte les clés manquantes à la compilation.",
    },
    period: { start: "2026", end: "present" },
    group: "library",
    category: "embedded",
    symbol: "文",
    tags: ["Rust", "Proc macros", "no_std", "i18n"],
    ranking: {
      technicalDepth: 4.3,
      originality: 4,
      practicalImpact: 3.2,
      evidence: 4.2,
    },
    externalUrl: "https://github.com/AlixANNERAUD/embedded_i18n",
  },
  {
    id: "getargs-derive",
    title: "getargs-derive",
    description: {
      en: "Clap-style derive macros for no_std Rust command-line parsers, with no allocation and help text built at compile time.",
      fr: "Des macros de dérivation façon Clap pour analyser la ligne de commande en Rust no_std, sans allocation, avec une aide générée à la compilation.",
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
    externalUrl: "https://github.com/AlixANNERAUD/getargs_derive",
  },
  {
    id: "battery-percent",
    title: "battery-percent",
    description: {
      en: "A C99 library with no_std Rust bindings that turns a battery voltage into a charge percentage using real discharge curves.",
      fr: "Une bibliothèque C99 avec liaisons Rust no_std qui convertit la tension d’une batterie en pourcentage de charge, d’après des courbes de décharge.",
    },
    period: { start: "2021", end: "present" },
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
      en: "Jeanne d'Hack CTF 2026",
      fr: "Jeanne d’Hack CTF 2026",
    },
    description: {
      en: "Joint first place, tied with two other teams, in the overall ranking of the 2026 Jeanne d'Hack CTF, a cybersecurity competition at the University of Rouen.",
      fr: "Première place ex æquo avec deux autres équipes au classement général du CTF Jeanne d’Hack 2026, une compétition de cybersécurité à l’Université de Rouen.",
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
      en: "With the INSA Rouen team, first place in the overall ranking of Cod'INSA 2025, a team programming contest that rewards fast, correct algorithmic solutions.",
      fr: "Première place au classement général de Cod’INSA 2025, un concours de programmation par équipes qui récompense des solutions algorithmiques rapides et justes.",
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
      en: "Jeanne d'Hack CTF 2025",
      fr: "Jeanne d’Hack CTF 2025",
    },
    description: {
      en: "Third place in the overall ranking of the 2025 Jeanne d'Hack CTF, a cybersecurity competition at the University of Rouen, with the team Les Schtroumpfs.",
      fr: "Troisième place au classement général du CTF Jeanne d’Hack 2025, une compétition de cybersécurité à l’Université de Rouen, avec l’équipe Les Schtroumpfs.",
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
      en: "With Les Schtroumpfs, 36th place in the student ranking of TRACS 2024, the cybersecurity competition of the DGSE, France's foreign intelligence service.",
      fr: "Avec l’équipe Les Schtroumpfs, 36e place au classement étudiant de TRACS 2024, la compétition de cybersécurité de la DGSE, le renseignement extérieur français.",
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
      en: "A Django and Vue app that turns Deezer previews into MERT audio embeddings, to explore songs in 3D, find similar tracks and predict genres.",
      fr: "Une application Django et Vue qui transforme les extraits Deezer en représentations audio MERT, pour explorer les morceaux en 3D et prédire leurs genres.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "data",
    symbol: "∿",
    tags: ["Python", "Django", "Vue.js", "ML"],
    ranking: {
      technicalDepth: 4.4,
      originality: 3.9,
      practicalImpact: 3.7,
      evidence: 4.8,
    },
    team: 3,
    externalUrl: "https://github.com/AlixANNERAUD/deez_nalyzer",
  },
  {
    id: "eogm",
    title: {
      en: "Evidential Occupancy Grid Map (EOGM)",
      fr: "Cartographie d’occupation évidentielle (EOGM)",
    },
    description: {
      en: "A ROS node in C++ that fuses LiDAR scans and odometry into an evidential occupancy grid with Dempster-Shafer theory, sped up with AVX2.",
      fr: "Un nœud ROS en C++ qui fusionne balayages LiDAR et odométrie dans une grille d’occupation évidentielle selon Dempster-Shafer, accéléré par AVX2.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "embedded",
    symbol: "▦",
    tags: ["C++", "ROS", "Capteurs"],
    ranking: {
      technicalDepth: 4.4,
      originality: 4.2,
      practicalImpact: 3.4,
      evidence: 3,
    },
    team: 2,
    externalUrl: "https://github.com/AlixANNERAUD/Evidential_occupancy_map",
  },
  {
    id: "iti-adventure",
    title: "ITI Aventure",
    description: {
      en: "A terminal text adventure in Java 21, built by a team of two at INSA Rouen Normandie: rooms, locked doors, keys and roaming monsters, loaded from a text file.",
      fr: "Un jeu d’aventure textuel en Java 21, écrit à deux à l’INSA Rouen Normandie : pièces, portes verrouillées, clés, monstres et mondes lus dans un fichier texte.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "software",
    symbol: "{ }",
    tags: ["Java", "JUnit"],
    ranking: {
      technicalDepth: 2.8,
      originality: 2.7,
      practicalImpact: 2.2,
      evidence: 2.8,
    },
    team: 2,
    externalUrl: "https://github.com/AlixANNERAUD/iti_aventure",
  },
  {
    id: "huffman",
    title: {
      en: "Huffman compressor",
      fr: "Compresseur de Huffman",
    },
    description: {
      en: "A command-line Huffman compressor in C, built by a team of four at INSA Rouen Normandie, with its own file header, CUnit unit tests and round-trip tests.",
      fr: "Un compresseur de Huffman en C, écrit à quatre à l’INSA Rouen Normandie, avec son en-tête de fichier, des tests unitaires CUnit et des tests aller-retour.",
    },
    period: { start: "2023" },
    group: "academic",
    category: "systems",
    symbol: "01",
    tags: ["C", "Algorithmique"],
    ranking: {
      technicalDepth: 3.3,
      originality: 2.8,
      practicalImpact: 2.5,
      evidence: 3.7,
    },
    team: 4,
    externalUrl: "https://github.com/AlixANNERAUD/huffman_compressor",
  },
  {
    id: "robot-mouche",
    title: "Robot mouche",
    description: {
      en: "A Raspberry Pi 4 robot in C++, built by a team of four at INSA Rouen, driven from a web control panel over Wi-Fi or following a line seen by its camera.",
      fr: "Un robot Raspberry Pi 4 programmé en C++ à quatre à l’INSA Rouen, piloté en Wi-Fi depuis une page web ou suivant une ligne repérée par sa caméra.",
    },
    period: { start: "2023" },
    group: "academic",
    category: "embedded",
    symbol: "⚙",
    tags: ["C++", "Python"],
    ranking: {
      technicalDepth: 3.2,
      originality: 3,
      practicalImpact: 2.7,
      evidence: 3.3,
    },
    team: 4,
    externalUrl: "https://github.com/AlixANNERAUD/robot_mouche",
  },
  {
    id: "music-danceability",
    title: {
      en: "Music danceability prediction",
      fr: "Prédiction de la dansabilité musicale",
    },
    description: {
      en: "A team data science project that models Spotify's danceability score with multiple linear regression on 160,000 songs, then tests it on tracks from the API.",
      fr: "Projet d’équipe en science des données qui modélise la dansabilité Spotify par régression linéaire multiple sur 160 000 titres, puis teste le modèle via l’API.",
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
    team: 3,
    externalUrl:
      "https://github.com/AlixANNERAUD/music_danceability_prediction",
  },
  {
    id: "insatram",
    title: "INSAtram",
    description: {
      en: "A tram network game modeled on Mini Metro, written in Free Pascal with SDL 1.2 by a team of three at INSA Rouen, where each passenger is routed with Dijkstra.",
      fr: "Un jeu de tramway inspiré de Mini Metro, en Free Pascal avec SDL 1.2, écrit à trois à l’INSA Rouen, avec des trajets calculés par l’algorithme de Dijkstra.",
    },
    period: { start: "2022" },
    group: "academic",
    category: "software",
    symbol: "T",
    tags: ["Free Pascal", "SDL"],
    ranking: {
      technicalDepth: 3.2,
      originality: 3.4,
      practicalImpact: 2.5,
      evidence: 2.7,
    },
    team: 3,
    externalUrl: "https://github.com/AlixANNERAUD/insatram",
  },
  {
    id: "linear-equations",
    title: {
      en: "Linear system solvers in C",
      fr: "Solveurs de systèmes linéaires en C",
    },
    description: {
      en: "Seven ways to solve a linear system in plain C, from triangular substitution and Gaussian elimination to LU, Cholesky, Jacobi and Gauss-Seidel methods.",
      fr: "Sept façons de résoudre un système linéaire en C pur : substitution triangulaire, élimination de Gauss, LU, Cholesky, Jacobi et Gauss-Seidel.",
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
    team: 3,
    externalUrl:
      "https://github.com/AlixANNERAUD/system_of_linear_equations_solver",
  },
  {
    id: "odor-localization",
    title: {
      en: "Gas source localization",
      fr: "Localisation de sources de gaz",
    },
    description: {
      en: "A research prototype from an internship at NYU: ESP32 nodes send MQ gas sensor readings over MQTT, and a Python backend estimates where the gas comes from.",
      fr: "Prototype de recherche issu d’un stage à NYU : des nœuds ESP32 publient en MQTT les mesures de capteurs MQ, puis un programme Python estime l’origine du gaz.",
    },
    period: { start: "2024" },
    group: "academic",
    category: "embedded",
    symbol: "◎",
    tags: ["ESP32", "MQTT", "Python", "Capteurs", "Recherche"],
    ranking: {
      technicalDepth: 4.1,
      originality: 4,
      practicalImpact: 3.4,
      evidence: 3,
    },
    team: 2,
    externalUrl: "https://github.com/AlixANNERAUD/odor_localization",
  },
  {
    id: "medical-image-deep-learning",
    title: {
      en: "Melanoma histopathology segmentation",
      fr: "Segmentation histopathologique du mélanome",
    },
    description: {
      en: "Adapting CellViT++, nnU-Net and HoVer-Net to classify cell nuclei and segment tissue in melanoma images from the PUMA dataset, in a team of two at INSA Rouen.",
      fr: "Adaptation de CellViT++, nnU-Net et HoVer-Net pour classer les noyaux et segmenter les tissus d’images de mélanome (jeu PUMA), en binôme à l’INSA Rouen.",
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
    team: 2,
    externalUrl: "https://github.com/AlixANNERAUD/deep_learning_project",
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
