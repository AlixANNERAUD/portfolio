import type { Localized } from "./types.ts";

/**
 * Merged pull requests to other people's open-source projects, newest
 * project first. Only merged work is listed, each with links to the pull
 * requests themselves so every line can be checked.
 */
export interface Contribution {
  project: string;
  repository: string;
  /** Year or year range of the merged pull requests. */
  period: string;
  summary: Localized;
  pulls: readonly { number: number; url: string }[];
}

const pull = (repository: string, number: number) => ({
  number,
  url: `https://github.com/${repository}/pull/${number}`,
});

export const contributions = [
  {
    project: "smolvm",
    repository: "smol-machines/smolvm",
    period: "2026",
    summary: {
      en: "CPU and memory stats for running machines, published ports that change without a restart, chosen UDP destinations, and additions to the Rust SDK.",
      fr: "Statistiques CPU et mémoire des machines en cours d’exécution, ports publiés modifiables sans redémarrage, destinations UDP choisies, et ajouts au SDK Rust.",
    },
    pulls: [
      pull("smol-machines/smolvm", 1808),
      pull("smol-machines/smolvm", 1682),
      pull("smol-machines/smolvm", 1941),
      pull("smol-machines/smol", 315),
    ],
  },
  {
    project: "WAMR",
    repository: "wasm-micro-runtime/wasm-micro-runtime",
    period: "2025",
    summary: {
      en: "Instruction metering in the WebAssembly Micro Runtime: a call hands control back to the host after a set number of instructions, so a cooperative scheduler can share the processor.",
      fr: "Comptage d’instructions dans le WebAssembly Micro Runtime : un appel rend la main à l’hôte après un nombre d’instructions donné, pour qu’un ordonnanceur coopératif puisse partager le processeur.",
    },
    pulls: [pull("wasm-micro-runtime/wasm-micro-runtime", 4122)],
  },
  {
    project: "Embassy",
    repository: "embassy-rs/embassy",
    period: "2025",
    summary: {
      en: "An async RwLock for embassy-sync, the synchronization crate of the Embassy embedded framework.",
      fr: "Un RwLock asynchrone pour embassy-sync, la crate de synchronisation du framework embarqué Embassy.",
    },
    pulls: [pull("embassy-rs/embassy", 3932)],
  },
  {
    project: "WAMR Rust SDK",
    repository: "wasm-micro-runtime/wamr-rust-sdk",
    period: "2024–2025",
    summary: {
      en: "ESP32 support, custom platform configuration, a rework of the lifetimes in the module and instance API, and an update to WAMR 2.3.1.",
      fr: "Prise en charge de l’ESP32, configuration de plateforme personnalisée, refonte des durées de vie de l’API des modules et instances, et mise à jour vers WAMR 2.3.1.",
    },
    pulls: [
      pull("wasm-micro-runtime/wamr-rust-sdk", 23),
      pull("wasm-micro-runtime/wamr-rust-sdk", 65),
      pull("wasm-micro-runtime/wamr-rust-sdk", 83),
      pull("wasm-micro-runtime/wamr-rust-sdk", 142),
    ],
  },
  {
    project: "LVGL Rust bindings",
    repository: "lvgl/lv_binding_rust",
    period: "2025",
    summary: {
      en: "A feature to plug in a custom allocator, and a fix to the input device example.",
      fr: "Une option pour brancher un allocateur personnalisé, et une correction de l’exemple de périphérique d’entrée.",
    },
    pulls: [
      pull("lvgl/lv_binding_rust", 175),
      pull("lvgl/lv_binding_rust", 157),
    ],
  },
  {
    project: "esp-idf-svc",
    repository: "esp-rs/esp-idf-svc",
    period: "2024",
    summary: {
      en: "A safe Rust wrapper for the ESP-IDF SD, SDIO and SDMMC drivers and their virtual file system.",
      fr: "Une interface Rust sûre pour les pilotes SD, SDIO et SDMMC d’ESP-IDF et leur système de fichiers virtuel.",
    },
    pulls: [pull("esp-rs/esp-idf-svc", 422)],
  },
] as const satisfies readonly Contribution[];
