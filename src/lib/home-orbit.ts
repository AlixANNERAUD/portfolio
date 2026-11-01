/**
 * Homepage "orbit": the linked tiles of the hero, and their build-time
 * layout. Everything here runs at build time (and in the unit tests), so the
 * server-rendered page already holds the final composition: the browser
 * script only adds motion on top of it.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { experiences, homepageExperiences } from "../data/experiences.ts";
import type { Experience } from "../data/experiences.ts";
import {
  byScore,
  projectRank,
  projectUrl,
  projects,
  relatedProjects,
  type CatalogueProject,
  type ProjectCategory,
} from "../data/projects.ts";
import { localize } from "../data/types.ts";
import { locales, localizePath, type Locale } from "../i18n/locales.ts";
import { formatPeriod } from "./format.ts";

interface NodeBase {
  id: string;
  label: string;
  href: string;
  /** Shown, decoded, under the field while the tile is hovered or focused. */
  caption: string;
  /** Longest label across locales: the layout is the same in every locale. */
  labelLength: number;
}

export interface OrgNode extends NodeBase {
  kind: "org";
  monogram: string;
  logo?: { src: string; width: number; height: number };
  logoOnDark: boolean;
}

export interface ProjectNode extends NodeBase {
  kind: "project";
  symbol: string;
  category: ProjectCategory;
  /** 1-based catalogue rank. */
  rank: number;
  /** Related projects (same category or shared tags) that are also shown. */
  related: string[];
  /** Xila, pinned at the centre of the organizations' arc. */
  core: boolean;
}

export type OrbitNode = OrgNode | ProjectNode;

/** Fixed order of the category chips. */
export const categoryOrder: readonly ProjectCategory[] = [
  "systems",
  "embedded",
  "security",
  "web",
  "data",
  "infrastructure",
  "software",
];

/** Project tiles shown on narrow screens (the others are hidden by CSS). */
export const MOBILE_PROJECTS = 8;

/** The education entry shown next to the four homepage roles. */
const EDUCATION_ID = "insa-engineering";

/** Logo height inside its chip, in CSS pixels. */
export const LOGO_HEIGHT = 16;

/** Intrinsic size of a self-hosted SVG or WebP logo, read at build time. */
function intrinsicSize(src: string): { width: number; height: number } {
  const file = readFileSync(join(process.cwd(), "public", src));
  if (src.endsWith(".svg")) {
    const head = file.toString("utf8", 0, 2000);
    const svg = head.slice(head.indexOf("<svg"));
    const tag = svg.slice(0, svg.indexOf(">"));
    const viewBox = tag.match(/viewBox="([^"]+)"/);
    if (viewBox) {
      const [, , width, height] = viewBox[1].split(/[\s,]+/).map(Number);
      return { width, height };
    }
    const width = Number(tag.match(/\swidth="([\d.]+)/)?.[1]);
    const height = Number(tag.match(/\sheight="([\d.]+)/)?.[1]);
    return { width, height };
  }
  if (src.endsWith(".webp")) {
    const chunk = file.toString("ascii", 12, 16);
    if (chunk === "VP8 ") {
      return {
        width: file.readUInt16LE(26) & 0x3fff,
        height: file.readUInt16LE(28) & 0x3fff,
      };
    }
    if (chunk === "VP8L") {
      const bits = file.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    if (chunk === "VP8X") {
      return {
        width: file.readUIntLE(24, 3) + 1,
        height: file.readUIntLE(27, 3) + 1,
      };
    }
  }
  throw new Error(`Unsupported logo format: ${src}`);
}

function logoOf(entry: Experience): OrgNode["logo"] {
  if (!entry.logo) return undefined;
  const size = intrinsicSize(entry.logo);
  // Square marks read small next to wordmarks: give them a little more room.
  const height = size.width / size.height < 1.4 ? 20 : LOGO_HEIGHT;
  return {
    src: entry.logo,
    width: Math.round((size.width / size.height) * height),
    height,
  };
}

function maxLength(values: readonly string[]): number {
  return Math.max(...values.map((value) => [...value].length));
}

/** The organizations: homepage roles, in data order, then INSA engineering. */
export function orbitOrganizations(): Experience[] {
  const education = experiences.find((entry) => entry.id === EDUCATION_ID);
  if (!education) throw new Error(`Missing experience: ${EDUCATION_ID}`);
  return [...homepageExperiences, education];
}

/** The top-ranked projects, best first. */
export function orbitProjects(count: number): CatalogueProject[] {
  return [...projects].sort(byScore).slice(0, count);
}

/** Every tile of the field, organizations first, then projects by rank. */
export function buildOrbitNodes(
  lang: Locale,
  { projects: count = 14 }: { projects?: number } = {},
): OrbitNode[] {
  const experiencesPath = localizePath("/experiences", lang);
  const orgs: OrgNode[] = orbitOrganizations().map((entry) => ({
    kind: "org",
    id: entry.id,
    label: localize(entry.company, lang),
    labelLength: maxLength(
      locales.map((code) => localize(entry.company, code)),
    ),
    href: `${experiencesPath}#${entry.id}-title`,
    caption: `${entry.role[lang]} · ${entry.period[lang]}`,
    monogram: entry.monogram,
    logo: logoOf(entry),
    logoOnDark: !!entry.logoOnDark,
  }));
  const shown = orbitProjects(count);
  const shownIds = new Set<string>(shown.map((project) => project.id));
  const items: ProjectNode[] = shown.map((project) => ({
    kind: "project",
    id: project.id,
    label: localize(project.title, lang),
    labelLength: maxLength(
      locales.map((code) => localize(project.title, code)),
    ),
    href: projectUrl(project.id, lang),
    caption: `${project.description[lang]} · ${formatPeriod(project.period, lang)}`,
    symbol: project.symbol,
    category: project.category,
    rank: projectRank(project.id),
    related: relatedProjects(project.id, 3)
      .map((related) => related.id)
      .filter((id) => shownIds.has(id)),
    core: project.id === "xila",
  }));
  return [...orgs, ...items];
}

/** Distinct categories of the shown projects, in chip order. */
export function orbitCategories(
  nodes: readonly OrbitNode[],
): ProjectCategory[] {
  const present = new Set(
    nodes.flatMap((node) => (node.kind === "project" ? [node.category] : [])),
  );
  return categoryOrder.filter((category) => present.has(category));
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export interface OrbitPlacement {
  /** Desktop centre, percent of the hero. */
  x: number;
  y: number;
  /** Narrow-screen centre, percent of the field box. */
  mx: number;
  my: number;
  /** Idle drift amplitude (px), period and negative delay (s). */
  dx: number;
  dy: number;
  dd: number;
  dl: number;
}

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Reference fields the layout is computed for (px). Tiles keep their pixel
 * size while positions are percentages, so the references are the smallest
 * fields of each composition: larger screens only add room.
 */
export const DESKTOP_FIELD = { width: 1040, height: 680 };
export const MOBILE_FIELD = { width: 360, height: 500 };

/** The copy block (desktop, percent): no tile may cover it. */
export const EXCLUSION: Rect = { x0: 6, y0: 20, x1: 58, y1: 76 };
/**
 * The left of the hero, above and below the copy: kept clear so that no
 * connector crosses the name (percent).
 */
export const LEFT_ZONE: Rect = { x0: 0, y0: 0, x1: 48, y1: 100 };
/** The caption, bottom left of the hero on desktop (percent). */
export const CAPTION_ZONE: Rect = { x0: 0, y0: 84, x1: 60, y1: 100 };

/** Minimum clear gap between two tiles, px. */
export const DESKTOP_GAP = 18;
export const MOBILE_GAP = 10;
/** Edge margin, percent: desktop, then narrow screens. */
export const MARGIN = 5;
export const MOBILE_MARGIN = 3;
/** Xila, the core, on desktop and on narrow screens (percent). */
export const CORE = { x: 72, y: 50, mx: 50, my: 50 };

const MONO_CHAR = 6.7; // JetBrains Mono at --step--2, px per character
const MOBILE_LABEL_CHARS = 12;

/** Approximate tile size in px, used to keep tiles apart. */
export function footprint(
  node: OrbitNode,
  mode: "desktop" | "mobile",
): { width: number; height: number } {
  if (node.kind === "org") {
    const logo = node.logo ? node.logo.width + 12 : 28;
    const chars =
      mode === "mobile"
        ? Math.min(node.labelLength, MOBILE_LABEL_CHARS)
        : node.labelLength;
    const twoLines = mode === "mobile" && node.labelLength > MOBILE_LABEL_CHARS;
    return {
      width: 4 + logo + 8 + chars * MONO_CHAR + 14,
      height: twoLines ? 48 : 40,
    };
  }
  if (mode === "desktop") {
    // The core keeps its label visible; other labels unfold on hover.
    return node.core
      ? { width: 60 + 10 + node.labelLength * MONO_CHAR + 16, height: 60 }
      : { width: 44, height: 44 };
  }
  const size = node.core ? 56 : 44;
  const lines = node.labelLength > MOBILE_LABEL_CHARS ? 2 : 1;
  return {
    width: Math.max(
      size,
      Math.min(node.labelLength, MOBILE_LABEL_CHARS) * MONO_CHAR,
    ),
    height: size + 4 + lines * 15,
  };
}

/** mulberry32: a tiny seeded PRNG, so the layout is the same on every build. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tile box in px, centred on (x, y) percent of a field. */
export function tileRect(
  x: number,
  y: number,
  size: { width: number; height: number },
  field: { width: number; height: number },
): Rect {
  const cx = (x / 100) * field.width;
  const cy = (y / 100) * field.height;
  return {
    x0: cx - size.width / 2,
    y0: cy - size.height / 2,
    x1: cx + size.width / 2,
    y1: cy + size.height / 2,
  };
}

/** Clear distance between two boxes (negative when they overlap). */
export function rectGap(a: Rect, b: Rect): number {
  const dx = Math.max(b.x0 - a.x1, a.x0 - b.x1);
  const dy = Math.max(b.y0 - a.y1, a.y0 - b.y1);
  return Math.max(dx, dy);
}

function percentRect(
  rect: Rect,
  field: { width: number; height: number },
): Rect {
  return {
    x0: (rect.x0 / 100) * field.width,
    y0: (rect.y0 / 100) * field.height,
    x1: (rect.x1 / 100) * field.width,
    y1: (rect.y1 / 100) * field.height,
  };
}

interface Field {
  width: number;
  height: number;
  gap: number;
  /** Edge margin, percent. */
  margin: number;
  /** Zones no tile may cover (percent). */
  blocked: readonly Rect[];
}

const DESKTOP: Field = {
  ...DESKTOP_FIELD,
  gap: DESKTOP_GAP,
  margin: MARGIN,
  blocked: [EXCLUSION, LEFT_ZONE, CAPTION_ZONE],
};
const MOBILE: Field = {
  ...MOBILE_FIELD,
  gap: MOBILE_GAP,
  margin: MOBILE_MARGIN,
  blocked: [],
};

/** Clearance of a candidate: its smallest gap to the edges, zones and tiles. */
function clearance(rect: Rect, field: Field, placed: readonly Rect[]): number {
  const marginX = (field.margin / 100) * field.width;
  const marginY = (field.margin / 100) * field.height;
  let gap =
    Math.min(
      rect.x0 - marginX,
      rect.y0 - marginY,
      field.width - marginX - rect.x1,
      field.height - marginY - rect.y1,
    ) + field.gap; // edges only need the margin, not the tile gap
  for (const zone of field.blocked) {
    gap = Math.min(gap, rectGap(rect, percentRect(zone, field)));
  }
  for (const other of placed) gap = Math.min(gap, rectGap(rect, other));
  return gap;
}

/**
 * Poisson-disc style rejection: up to `tries` random candidates, the first
 * that keeps the full gap wins; if none does, the clearest candidate.
 */
function place(
  size: { width: number; height: number },
  field: Field,
  placed: readonly Rect[],
  sample: () => [number, number],
  tries = 200,
): [number, number] {
  let best: [number, number] = sample();
  let bestGap = -Infinity;
  for (let i = 0; i < tries; i++) {
    const [x, y] = i === 0 ? best : sample();
    const gap = clearance(tileRect(x, y, size, field), field, placed);
    if (gap >= field.gap) return [x, y];
    if (gap > bestGap) {
      best = [x, y];
      bestGap = gap;
    }
  }
  return best;
}

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/**
 * Deterministic positions for every node: the organizations on an arc
 * around the core (Xila), the other projects scattered around the copy.
 * `mobileVisible` nodes (organizations and the first projects) are spaced
 * on narrow screens too; the rest are hidden there.
 */
export function layoutOrbit(
  nodes: readonly OrbitNode[],
  seed = 0xa11c5,
): OrbitPlacement[] {
  const random = mulberry32(seed);
  const orgCount = nodes.filter((node) => node.kind === "org").length;
  let orgIndex = 0;

  // The core goes first, so the organizations' arc wraps around it.
  const order = [...nodes.keys()].sort(
    (a, b) => Number(isCore(nodes[b])) - Number(isCore(nodes[a])),
  );
  const desktop: Tile[] = [];
  const mobile: Tile[] = [];
  const drift = new Map<
    number,
    Omit<OrbitPlacement, "x" | "y" | "mx" | "my">
  >();

  for (const index of order) {
    const node = nodes[index];
    const size = footprint(node, "desktop");
    const mobileSize = footprint(node, "mobile");
    const core = isCore(node);
    let at: [number, number];
    if (core) {
      at = [CORE.x, CORE.y];
    } else if (node.kind === "org") {
      // An arc opening towards the copy: -126° to 126°, jittered ±8°.
      const step = 252 / Math.max(1, orgCount - 1);
      const base = -126 + step * orgIndex++;
      at = place(size, DESKTOP, desktop.map(rectOf(DESKTOP)), () => {
        const angle = ((base + (random() * 2 - 1) * 8) * Math.PI) / 180;
        const reach = 1 + random() * 0.12;
        return [
          CORE.x + Math.cos(angle) * 20 * reach,
          CORE.y + Math.sin(angle) * 30 * reach,
        ];
      });
    } else {
      // Biased to the right half, around the core.
      at = place(size, DESKTOP, desktop.map(rectOf(DESKTOP)), () => [
        MARGIN + (100 - 2 * MARGIN) * random() ** 0.55,
        MARGIN + (100 - 2 * MARGIN) * random(),
      ]);
    }
    desktop.push({ index, x: at[0], y: at[1], size, pinned: core });

    if (core) {
      mobile.push({
        index,
        x: CORE.mx,
        y: CORE.my,
        size: mobileSize,
        pinned: true,
      });
    } else if (visibleOnMobile(node)) {
      const [mx, my] = place(
        mobileSize,
        MOBILE,
        mobile.map(rectOf(MOBILE)),
        () => [
          MOBILE_MARGIN + (100 - 2 * MOBILE_MARGIN) * random(),
          MOBILE_MARGIN + (100 - 2 * MOBILE_MARGIN) * random(),
        ],
      );
      mobile.push({ index, x: mx, y: my, size: mobileSize, pinned: false });
    }

    const dd = 9 + random() * 8;
    drift.set(index, {
      dx: round(5 + random() * 6),
      dy: round(4 + random() * 5),
      dd: round(dd),
      dl: round(-random() * dd),
    });
  }

  relax(desktop, DESKTOP);
  relax(mobile, MOBILE);
  const desktopAt = new Map(desktop.map((tile) => [tile.index, tile]));
  const mobileAt = new Map(mobile.map((tile) => [tile.index, tile]));
  return nodes.map((_, index) => {
    const d = desktopAt.get(index)!;
    // Hidden on narrow screens: any position will do.
    const m = mobileAt.get(index) ?? { x: 50, y: 50 };
    return {
      x: round(d.x),
      y: round(d.y),
      mx: round(m.x),
      my: round(m.y),
      ...drift.get(index)!,
    };
  });
}

interface Tile {
  index: number;
  /** Centre, percent. */
  x: number;
  y: number;
  size: { width: number; height: number };
  pinned: boolean;
}

const rectOf = (field: Field) => (tile: Tile) =>
  tileRect(tile.x, tile.y, tile.size, field);

/**
 * Resolves what rejection sampling could not: overlapping tiles, or tiles
 * on a blocked zone, are pushed apart along their shallowest axis until
 * every gap holds. Deterministic, and a no-op on an already clean layout.
 */
function relax(tiles: Tile[], field: Field): void {
  const { width, height, gap } = field;
  const mx = (field.margin / 100) * width;
  const my = (field.margin / 100) * height;
  const clamp = (tile: Tile) => {
    const hw = tile.size.width / 2;
    const hh = tile.size.height / 2;
    tile.x =
      (Math.min(Math.max((tile.x / 100) * width, mx + hw), width - mx - hw) /
        width) *
      100;
    tile.y =
      (Math.min(Math.max((tile.y / 100) * height, my + hh), height - my - hh) /
        height) *
      100;
  };
  const zones = field.blocked.map((zone) => percentRect(zone, field));
  for (let pass = 0; pass < 400; pass++) {
    let moved = false;
    for (let i = 0; i < tiles.length; i++) {
      const a = tiles[i];
      for (let j = i + 1; j < tiles.length; j++) {
        const b = tiles[j];
        const dx = ((b.x - a.x) / 100) * width;
        const dy = ((b.y - a.y) / 100) * height;
        const ox = (a.size.width + b.size.width) / 2 + gap - Math.abs(dx);
        const oy = (a.size.height + b.size.height) / 2 + gap - Math.abs(dy);
        if (ox <= 0.01 || oy <= 0.01) continue;
        moved = true;
        const share = a.pinned ? [0, 1] : b.pinned ? [1, 0] : [0.5, 0.5];
        if (ox < oy) {
          const push = ((ox + 0.1) / width) * 100 * (dx < 0 ? -1 : 1);
          a.x -= push * share[0];
          b.x += push * share[1];
        } else {
          const push = ((oy + 0.1) / height) * 100 * (dy < 0 ? -1 : 1);
          a.y -= push * share[0];
          b.y += push * share[1];
        }
      }
    }
    for (const tile of tiles) {
      if (tile.pinned) continue;
      for (const zone of zones) {
        const r = tileRect(tile.x, tile.y, tile.size, field);
        const left = r.x1 + gap - zone.x0;
        const right = zone.x1 + gap - r.x0;
        const up = r.y1 + gap - zone.y0;
        const down = zone.y1 + gap - r.y0;
        if (left <= 0 || right <= 0 || up <= 0 || down <= 0) continue;
        moved = true;
        const least = Math.min(left, right, up, down);
        if (least === left) tile.x -= ((left + 0.1) / width) * 100;
        else if (least === right) tile.x += ((right + 0.1) / width) * 100;
        else if (least === up) tile.y -= ((up + 0.1) / height) * 100;
        else tile.y += ((down + 0.1) / height) * 100;
      }
      clamp(tile);
    }
    if (!moved) return;
  }
}

function isCore(node: OrbitNode): boolean {
  return node.kind === "project" && node.core;
}

/** Whether the node is shown on narrow screens. */
export function visibleOnMobile(node: OrbitNode): boolean {
  return node.kind === "org" || node.rank <= MOBILE_PROJECTS;
}
