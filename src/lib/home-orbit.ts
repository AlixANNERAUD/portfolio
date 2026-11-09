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
  projectLogo,
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
  /** The label in every locale: the layout is the same in every locale. */
  labels: string[];
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
  /** The project's official symbol, shown instead of `symbol`. */
  logo?: string;
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
    labels: locales.map((code) => localize(entry.company, code)),
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
    labels: locales.map((code) => localize(project.title, code)),
    href: projectUrl(project.id, lang),
    caption: `${project.description[lang]} · ${formatPeriod(project.period, lang)}`,
    symbol: project.symbol,
    logo: projectLogo(project),
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

/**
 * The hero has three compositions, each laid out at build time for the
 * smallest field it is shown in. Positions are percentages while tiles keep
 * their pixel size, so a larger field only adds room.
 * - `desktop` (960px and wider, with hover): the copy on the left, every
 *   tile in the right column, projects as glyphs whose name unfolds on hover.
 * - `touch` (960px and wider, without hover): the same field with the
 *   narrow-screen set of tiles, every name always visible.
 * - `mobile` (narrower screens): the copy, then the field as its own box.
 */
export type OrbitMode = "desktop" | "touch" | "mobile";

export interface OrbitPlacement {
  /** Desktop centre, percent of the hero. */
  x: number;
  y: number;
  /** Touch centre, percent of the hero. */
  tx: number;
  ty: number;
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
 * Reference fields (px): the smallest of each composition. The desktop hero
 * is at least DESKTOP_FIELD.height tall, and 960px wide less a scrollbar; the
 * narrow field box is at least MOBILE_FIELD.height tall.
 */
export const DESKTOP_FIELD = { width: 940, height: 600 };
export const MOBILE_FIELD = { width: 320, height: 520 };

/**
 * The copy column on desktop (percent of the hero), top to bottom: the copy
 * is at most 7/12 of the page column (58% of the hero at 960px, less on wider
 * screens) and nearly as tall as the hero on a laptop, the caption sits under
 * it, and no connector may cross the name. No tile comes within the gap.
 */
export const COPY_ZONE: Rect = { x0: 0, y0: 0, x1: 58, y1: 100 };

/** Minimum clear gap between two tiles, and to a blocked zone, px. */
export const DESKTOP_GAP = 18;
export const MOBILE_GAP = 12;
/** Edge margin, percent: desktop and touch, then narrow screens. */
export const MARGIN = 5;
export const MOBILE_MARGIN = 4;
/** Xila, the core, on desktop and touch, then on narrow screens (percent). */
export const CORE = { x: 76, y: 50, mx: 50, my: 50 };

/**
 * Largest idle drift either way (px), and its scale on narrow screens: two
 * neighbours drifting towards each other never close the gap between them.
 */
export const DRIFT_X = 8;
export const DRIFT_Y = 6;
export const MOBILE_DRIFT = 0.5;

/* Label metrics, px, at the largest --step--2 (0.72rem) and --step--1. */
const CH = 7.2; // JetBrains Mono, letter spacing included
const CORE_CH = 9.2;
const LINE = 14.5;
/** A wrapped label is 12ch wide. */
const WRAP_WIDTH = 84;

/**
 * Greedy wrap, like the browser's: breaks at spaces and after hyphens,
 * `limit` characters per line, a longer word on a line of its own.
 */
export function wrapLabel(label: string, limit: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of label.split(" ")) {
    word.split(/(?<=-)/).forEach((part, i) => {
      const joined = line + (i === 0 && line ? " " : "") + part;
      if (line && [...joined].length > limit) {
        lines.push(line);
        line = part;
      } else {
        line = joined;
      }
    });
  }
  lines.push(line);
  return lines;
}

/** Size of a label wrapped at 12ch, in its widest locale. */
function wrappedLabel(
  labels: readonly string[],
  limit: number,
  padding: number,
): { width: number; lines: number } {
  let width = 0;
  let lines = 0;
  for (const label of labels) {
    const wrapped = wrapLabel(label, limit);
    const longest = Math.max(...wrapped.map((line) => [...line].length));
    // The label is at least as wide as its longest word (min-content).
    width = Math.max(
      width,
      wrapped.length > 1 ? WRAP_WIDTH : 0,
      longest * CH + padding,
    );
    lines = Math.max(lines, wrapped.length);
  }
  return { width, lines };
}

const longest = (labels: readonly string[]) =>
  Math.max(...labels.map((label) => [...label].length));

/** Tile size in px, as rendered in each composition (see HomeOrbit). */
export function footprint(
  node: OrbitNode,
  mode: OrbitMode,
): { width: number; height: number } {
  if (node.kind === "org") {
    // Logo plate (at least 1.75rem), padding, gap and border around the name.
    const plate = Math.max(28, (node.logo?.width ?? 0) + 12);
    if (mode === "desktop") {
      return { width: plate + longest(node.labels) * CH + 30, height: 40 };
    }
    const label = wrappedLabel(node.labels, 11, 0);
    return {
      width: plate + label.width + 30,
      height: Math.max(44, 10 + label.lines * LINE),
    };
  }
  if (mode === "desktop") {
    // The core keeps its name beside it; other names unfold on hover.
    return node.core
      ? { width: 60 + 10 + longest(node.labels) * CORE_CH + 2, height: 60 }
      : { width: 44, height: 44 };
  }
  // Glyph above its name, always visible.
  const glyph = node.core ? 56 : 44;
  const label = wrappedLabel(node.labels, 10, 8);
  return {
    width: Math.max(glyph, label.width),
    height: glyph + (node.core ? 10 : 4) + label.lines * LINE,
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

/** A percent rectangle in px of a field. */
export function percentRect(
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

export interface OrbitField {
  width: number;
  height: number;
  gap: number;
  /** Edge margin, percent. */
  margin: number;
  /** Zones no tile may come within the gap of (percent). */
  blocked: readonly Rect[];
}

/** The reference field of each composition. */
export const ORBIT_FIELDS: Record<OrbitMode, OrbitField> = {
  desktop: {
    ...DESKTOP_FIELD,
    gap: DESKTOP_GAP,
    margin: MARGIN,
    blocked: [COPY_ZONE],
  },
  touch: {
    ...DESKTOP_FIELD,
    gap: DESKTOP_GAP,
    margin: MARGIN,
    blocked: [COPY_ZONE],
  },
  mobile: {
    ...MOBILE_FIELD,
    gap: MOBILE_GAP,
    margin: MOBILE_MARGIN,
    blocked: [],
  },
};

/** Whether the node is shown in a composition. */
export function shownIn(node: OrbitNode, mode: OrbitMode): boolean {
  return mode === "desktop" || visibleOnMobile(node);
}

/** Clearance of a candidate: its smallest gap to the edges, zones and tiles. */
function clearance(
  rect: Rect,
  field: OrbitField,
  placed: readonly Rect[],
): number {
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
  field: OrbitField,
  placed: readonly Rect[],
  sample: () => [number, number],
  tries = 400,
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

export interface Tile {
  index: number;
  /** Centre, percent. */
  x: number;
  y: number;
  size: { width: number; height: number };
  pinned: boolean;
}

const rectOf = (field: OrbitField) => (tile: Tile) =>
  tileRect(tile.x, tile.y, tile.size, field);

/**
 * One attempt at a composition: the core first, then the organizations on an
 * arc around it (desktop and touch) and the projects by rank, each placed by
 * rejection sampling, then relaxed until every gap holds (or relax throws).
 */
function attemptField(
  nodes: readonly OrbitNode[],
  mode: OrbitMode,
  random: () => number,
): Map<number, Tile> {
  const field = ORBIT_FIELDS[mode];
  const wide = mode !== "mobile";
  const shown = [...nodes.keys()].filter((i) => shownIn(nodes[i], mode));
  const order = [
    ...shown.filter((i) => isCore(nodes[i])),
    ...shown.filter((i) => !isCore(nodes[i])),
  ];
  const orgCount = shown.filter((i) => nodes[i].kind === "org").length;
  const { margin } = field;
  const left = wide ? COPY_ZONE.x1 : margin;
  let orgIndex = 0;
  const tiles: Tile[] = [];
  for (const index of order) {
    const node = nodes[index];
    const size = footprint(node, mode);
    const placed = tiles.map(rectOf(field));
    let at: [number, number];
    if (isCore(node)) {
      at = wide ? [CORE.x, CORE.y] : [CORE.mx, CORE.my];
    } else if (wide && node.kind === "org") {
      // An arc opening towards the copy: -126° to 126°, jittered ±8°.
      const step = 252 / Math.max(1, orgCount - 1);
      const base = -126 + step * orgIndex++;
      at = place(size, field, placed, () => {
        const angle = ((base + (random() * 2 - 1) * 8) * Math.PI) / 180;
        const reach = 1 + random() * 0.12;
        return [
          CORE.x + Math.cos(angle) * 16 * reach,
          CORE.y + Math.sin(angle) * 34 * reach,
        ];
      });
    } else {
      at = place(size, field, placed, () => [
        left + (100 - margin - left) * random(),
        margin + (100 - 2 * margin) * random(),
      ]);
    }
    tiles.push({ index, x: at[0], y: at[1], size, pinned: isCore(node) });
  }
  relax(tiles, field, mode);
  return new Map(tiles.map((tile) => [tile.index, tile]));
}

/** Attempts per composition before the build gives up. */
const ATTEMPTS = 64;

/**
 * A composition from the first of the seeds after `seed` that relaxes into
 * a clean layout: still deterministic, and a new or renamed tile only moves
 * to the next seed instead of failing the build.
 */
function layoutField(
  nodes: readonly OrbitNode[],
  mode: OrbitMode,
  seed: number,
): Map<number, Tile> {
  let failure: unknown;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      return attemptField(nodes, mode, mulberry32(seed + attempt));
    } catch (error) {
      failure = error;
    }
  }
  throw failure;
}

/**
 * Deterministic positions for every node in the three compositions, and its
 * idle drift. A node hidden in a composition gets its core's position.
 */
export function layoutOrbit(
  nodes: readonly OrbitNode[],
  seed = 0xa11c5,
): OrbitPlacement[] {
  const desktop = layoutField(nodes, "desktop", seed);
  const touch = layoutField(nodes, "touch", seed + 0x100);
  const mobile = layoutField(nodes, "mobile", seed + 0x200);
  const random = mulberry32(seed + 0x300);
  return nodes.map((_, index) => {
    const d = desktop.get(index)!;
    const t = touch.get(index) ?? { x: CORE.x, y: CORE.y };
    const m = mobile.get(index) ?? { x: CORE.mx, y: CORE.my };
    const dd = 9 + random() * 8;
    return {
      x: round(d.x),
      y: round(d.y),
      tx: round(t.x),
      ty: round(t.y),
      mx: round(m.x),
      my: round(m.y),
      dx: round((DRIFT_X * (1 + random())) / 2, 0),
      dy: round((DRIFT_Y * (1 + random())) / 2, 0),
      dd: round(dd),
      dl: round(-random() * dd),
    };
  });
}

/**
 * Resolves what rejection sampling could not: overlapping tiles, or tiles
 * on a blocked zone, are pushed apart along their shallowest axis until
 * every gap holds. Deterministic, and a no-op on an already clean layout.
 * Throws when the tiles do not fit: the build never ships an overlap.
 */
export function relax(tiles: Tile[], field: OrbitField, name = "orbit"): void {
  const { width, height, gap } = field;
  const mx = (field.margin / 100) * width;
  const my = (field.margin / 100) * height;
  const zones = field.blocked.map((zone) => percentRect(zone, field));
  // Where tile edges may go: inside the margins, and clear of any zone that
  // spans the whole field from an edge (the desktop copy column).
  const edges = { x0: mx, x1: width - mx, y0: my, y1: height - my };
  for (const zone of zones) {
    const tall = zone.y0 <= 0 && zone.y1 >= height;
    const wide = zone.x0 <= 0 && zone.x1 >= width;
    if (tall && zone.x0 <= 0) edges.x0 = Math.max(edges.x0, zone.x1 + gap);
    if (tall && zone.x1 >= width) edges.x1 = Math.min(edges.x1, zone.x0 - gap);
    if (wide && zone.y0 <= 0) edges.y0 = Math.max(edges.y0, zone.y1 + gap);
    if (wide && zone.y1 >= height) edges.y1 = Math.min(edges.y1, zone.y0 - gap);
  }
  /** How far (px) a tile can move along an axis, -1 or 1, before an edge. */
  const room = (tile: Tile, axis: "x" | "y", dir: number) => {
    if (tile.pinned) return 0;
    const r = tileRect(tile.x, tile.y, tile.size, field);
    const free =
      axis === "x"
        ? dir < 0
          ? r.x0 - edges.x0
          : edges.x1 - r.x1
        : dir < 0
          ? r.y0 - edges.y0
          : edges.y1 - r.y1;
    return Math.max(0, free);
  };
  const clamp = (tile: Tile) => {
    const hw = tile.size.width / 2;
    const hh = tile.size.height / 2;
    const cx = (tile.x / 100) * width;
    const cy = (tile.y / 100) * height;
    tile.x =
      (Math.min(Math.max(cx, edges.x0 + hw), edges.x1 - hw) / width) * 100;
    tile.y =
      (Math.min(Math.max(cy, edges.y0 + hh), edges.y1 - hh) / height) * 100;
  };
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
        if (a.pinned && b.pinned) continue;
        // Along the shallower axis, unless the edges leave no room there.
        const sx = dx < 0 ? -1 : 1;
        const sy = dy < 0 ? -1 : 1;
        const roomX = room(a, "x", -sx) + room(b, "x", sx);
        const roomY = room(a, "y", -sy) + room(b, "y", sy);
        const alongX = roomX > ox === roomY > oy ? ox < oy : roomX > ox;
        const axis = alongX ? "x" : "y";
        const need = (alongX ? ox : oy) + 0.1;
        const s = alongX ? sx : sy;
        // Split the push, each tile within its own room.
        const ra = room(a, axis, -s);
        const rb = room(b, axis, s);
        let pa = a.pinned ? 0 : b.pinned ? need : need / 2;
        pa = Math.min(Math.max(pa, need - rb), ra);
        const pb = b.pinned ? 0 : need - pa;
        const scale = 100 / (alongX ? width : height);
        a[axis] -= pa * s * scale;
        b[axis] += pb * s * scale;
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
        // The shallowest way out that stays inside the margins (a zone may
        // span the whole field one way).
        const ways = [
          { d: left, ok: r.x0 - left >= mx, x: -1, y: 0 },
          { d: right, ok: r.x1 + right <= width - mx, x: 1, y: 0 },
          { d: up, ok: r.y0 - up >= my, x: 0, y: -1 },
          { d: down, ok: r.y1 + down <= height - my, x: 0, y: 1 },
        ];
        const way = (
          ways.some((w) => w.ok) ? ways.filter((w) => w.ok) : ways
        ).sort((a, b) => a.d - b.d)[0];
        tile.x += ((way.d + 0.1) / width) * 100 * way.x;
        tile.y += ((way.d + 0.1) / height) * 100 * way.y;
      }
      clamp(tile);
    }
    if (!moved) return;
  }
  throw new Error(
    `Home orbit: the ${name} tiles do not fit in ${width}×${height}px`,
  );
}

function isCore(node: OrbitNode): boolean {
  return node.kind === "project" && node.core;
}

/** Whether the node is shown on narrow and touch screens. */
export function visibleOnMobile(node: OrbitNode): boolean {
  return node.kind === "org" || node.rank <= MOBILE_PROJECTS;
}
