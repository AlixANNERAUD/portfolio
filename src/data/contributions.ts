import type { Localized } from "./types.ts";

/**
 * Merged pull requests to other people's open-source projects, newest
 * project first. Only merged work is listed, each with links to the pull
 * requests themselves so every line can be checked. The About page shows
 * the first `RECENT_CONTRIBUTIONS` and folds the rest behind a toggle.
 */
export interface Contribution {
  project: string;
  repository: string;
  /** Year or year range of the merged pull requests. */
  period: string;
  summary: Localized;
  pulls: readonly { number: number; url: string }[];
}

/** Projects shown before the "show earlier" toggle on the About page. */
export const RECENT_CONTRIBUTIONS = 4;

const pull = (repository: string, number: number) => ({
  number,
  url: `https://github.com/${repository}/pull/${number}`,
});

export const contributions = [
  {
    project: "tar-no-std",
    repository: "phip1611/tar-no-std",
    period: "2026",
    summary: {
      en: "A streaming parser that reads archives one 512-byte block at a time, pulled from flash or pushed by an interrupt or a network stack, and modification times read as octal, as the tar format defines them.",
      fr: "Un analyseur en flux qui lit les archives par blocs de 512 octets, lus depuis une mémoire flash ou reçus d’une interruption ou d’une pile réseau, et des dates de modification lues en octal, comme le définit le format tar.",
    },
    pulls: [
      pull("phip1611/tar-no-std", 79),
      pull("phip1611/tar-no-std", 73),
      pull("phip1611/tar-no-std", 74),
      pull("phip1611/tar-no-std", 72),
    ],
  },
  {
    project: "mipidsi",
    repository: "almindor/mipidsi",
    period: "2026",
    summary: {
      en: "Raw pixel writes for this embedded Rust MIPI display driver: data already in the display’s native format, from a GUI library or a framebuffer, goes to the bus without per-pixel conversion.",
      fr: "L’écriture de pixels bruts pour ce pilote d’écrans MIPI en Rust embarqué : les données déjà au format natif de l’écran, issues d’une bibliothèque graphique ou d’un tampon d’image, partent sur le bus sans conversion pixel par pixel.",
    },
    pulls: [pull("almindor/mipidsi", 205)],
  },
  {
    project: "ESP-NN",
    repository: "espressif/esp-nn",
    period: "2026",
    summary: {
      en: "A fix to the int8 softmax kernels of Espressif’s neural network library, whose signed shifts into the sign bit were undefined behavior in C, with unchanged outputs.",
      fr: "Une correction des noyaux softmax int8 de la bibliothèque de réseaux de neurones d’Espressif, dont les décalages signés vers le bit de signe étaient un comportement indéfini en C, sans changer leurs résultats.",
    },
    pulls: [pull("espressif/esp-nn", 55)],
  },
  {
    project: "progress-bar",
    repository: "Mubelotix/progress-bar",
    period: "2026",
    summary: {
      en: "Rendering without allocations and a clock the caller can provide, as first steps toward no_std, support for the NO_COLOR convention, and fixes to the estimated time left and to a panic on non-ASCII names.",
      fr: "Un rendu sans allocation et une horloge fournie par l’appelant, premiers pas vers no_std, la prise en charge de la convention NO_COLOR, et des corrections du temps restant estimé et d’une panique sur les noms non ASCII.",
    },
    pulls: [
      pull("Mubelotix/progress-bar", 17),
      pull("Mubelotix/progress-bar", 16),
      pull("Mubelotix/progress-bar", 15),
    ],
  },
  {
    project: "MicroFlow",
    repository: "matteocarnelos/microflow-rs",
    period: "2026",
    summary: {
      en: "Support in this Rust TinyML inference engine for fully connected layers without a bias tensor, which the TensorFlow Lite converter drops when it is all zeros.",
      fr: "La prise en charge, dans ce moteur d’inférence TinyML en Rust, des couches entièrement connectées sans tenseur de biais, que le convertisseur TensorFlow Lite omet quand il est nul.",
    },
    pulls: [pull("matteocarnelos/microflow-rs", 19)],
  },
  {
    project: "mbrman",
    repository: "rust-disk-partition-management/mbrman",
    period: "2026",
    summary: {
      en: "no_std support for this MBR partition table crate, and hand-written encoding of the boot records in place of the unmaintained bincode dependency.",
      fr: "La prise en charge de no_std pour cette crate de tables de partitions MBR, et un encodage écrit à la main des enregistrements d’amorçage à la place de la dépendance bincode, qui n’est plus maintenue.",
    },
    pulls: [
      pull("rust-disk-partition-management/mbrman", 41),
      pull("rust-disk-partition-management/mbrman", 40),
    ],
  },
  {
    project: "LVGL",
    repository: "lvgl/lvgl",
    period: "2026",
    summary: {
      en: "A fix to the dropdown widget, whose open list kept reading its options after they were freed or replaced.",
      fr: "Une correction du widget de liste déroulante, dont la liste ouverte continuait de lire ses options après leur libération ou leur remplacement.",
    },
    pulls: [pull("lvgl/lvgl", 10898)],
  },
  {
    project: "smolvm",
    repository: "smol-machines/smolvm",
    period: "2026",
    summary: {
      en: "CPU and memory stats for running machines, with macOS CPU time fixed, published ports that change without a restart, chosen UDP destinations, and additions to the Rust SDK.",
      fr: "Statistiques CPU et mémoire des machines en cours d’exécution, avec un temps CPU corrigé sur macOS, ports publiés modifiables sans redémarrage, destinations UDP choisies, et ajouts au SDK Rust.",
    },
    pulls: [
      pull("smol-machines/smolvm", 1808),
      pull("smol-machines/smolvm", 1807),
      pull("smol-machines/smolvm", 1682),
      pull("smol-machines/smolvm", 1941),
      pull("smol-machines/smol", 315),
      pull("smol-machines/smol", 316),
      pull("smol-machines/smol", 317),
    ],
  },
  {
    project: "opus-rs",
    repository: "restsend/opus-rs",
    period: "2026",
    summary: {
      en: "Builds of this pure-Rust Opus codec for microcontrollers: targets without compare-and-swap, and a decoder built in place rather than on the stack.",
      fr: "La compilation de ce codec Opus en Rust pour microcontrôleurs, sur les cibles sans compare-and-swap, et un décodeur construit en place plutôt que sur la pile.",
    },
    pulls: [pull("restsend/opus-rs", 64), pull("restsend/opus-rs", 65)],
  },
  {
    project: "Congo",
    repository: "jpanther/congo",
    period: "2026",
    summary: {
      en: "A custom script URL for Umami analytics in this Hugo theme, for self-hosted instances and proxies.",
      fr: "Une adresse de script personnalisée pour les statistiques Umami dans ce thème Hugo, pour les instances auto-hébergées et les proxys.",
    },
    pulls: [pull("jpanther/congo", 1103)],
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
      en: "ESP32 support, custom platform configuration, a rework of the lifetimes in the module and instance API, modules loaded without copying their bytecode, and an update to WAMR 2.3.1.",
      fr: "Prise en charge de l’ESP32, configuration de plateforme personnalisée, refonte des durées de vie de l’API des modules et instances, chargement des modules sans copie de leur bytecode, et mise à jour vers WAMR 2.3.1.",
    },
    pulls: [
      pull("wasm-micro-runtime/wamr-rust-sdk", 23),
      pull("wasm-micro-runtime/wamr-rust-sdk", 48),
      pull("wasm-micro-runtime/wamr-rust-sdk", 65),
      pull("wasm-micro-runtime/wamr-rust-sdk", 74),
      pull("wasm-micro-runtime/wamr-rust-sdk", 77),
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
  {
    project: "ESPNexUpload",
    repository: "Nredor/ESPNexUpload",
    period: "2023",
    summary: {
      en: "The SD card example of this library for updating Nextion displays over the air, fixed for the ESP32: the default chip-select pin and an absolute file path.",
      fr: "L’exemple de lecture sur carte SD de cette bibliothèque de mise à jour à distance des écrans Nextion, corrigé pour l’ESP32 : la broche de sélection par défaut et un chemin de fichier absolu.",
    },
    pulls: [pull("Nredor/ESPNexUpload", 17)],
  },
  {
    project: "Berry",
    repository: "berry-lang/berry",
    period: "2023",
    summary: {
      en: "Native module object constructors named after their structure, so that the C API header of this embedded scripting language compiles as C++.",
      fr: "Des constructeurs d’objets de modules natifs nommés d’après leur structure, pour que l’en-tête de l’API C de ce langage de script embarqué compile en C++.",
    },
    pulls: [pull("berry-lang/berry", 317)],
  },
  {
    project: "ps2kbdlib",
    repository: "michalhol/ps2kbdlib",
    period: "2021",
    summary: {
      en: "A build fix for this PS/2 keyboard library for ESP32 and Arduino: members initialized in declaration order, for builds with -Werror=reorder, and a zeroed scancode buffer.",
      fr: "Une correction de compilation pour cette bibliothèque de clavier PS/2 pour ESP32 et Arduino : des membres initialisés dans l’ordre de leur déclaration, pour les compilations avec -Werror=reorder, et un tampon de codes de touches mis à zéro.",
    },
    pulls: [pull("michalhol/ps2kbdlib", 6)],
  },
  {
    project: "ULPSoundESP32",
    repository: "bitluni/ULPSoundESP32",
    period: "2020",
    summary: {
      en: "A stereo mode and a README for this ESP32 sound player, which streams samples to the DAC from the ultra-low-power coprocessor.",
      fr: "Un mode stéréo et un README pour ce lecteur audio ESP32, qui envoie les échantillons au CNA depuis le coprocesseur ultra basse consommation.",
    },
    pulls: [pull("bitluni/ULPSoundESP32", 3)],
  },
] as const satisfies readonly Contribution[];
