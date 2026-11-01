/**
 * Layout of the Xila architecture diagram shown on the homepage. It depicts
 * the layers of the Xila project only, not a map of a career. Coordinates are
 * WebGL clip space (x and y in -1..1, y up), shared by the static SVG
 * fallback, the HTML labels and the WebGL renderer.
 */
import type { UIKey } from "../../i18n/ui.ts";

export type Point = readonly [x: number, y: number];

export interface TopologyNode {
  position: Point;
  label: UIKey;
}

export const NODES: readonly TopologyNode[] = [
  { position: [-0.76, -0.47], label: "xila.topology.node.drivers" },
  { position: [-0.33, 0.12], label: "xila.topology.node.services" },
  { position: [0.22, 0.12], label: "xila.topology.node.abi" },
  { position: [0.78, 0.4], label: "xila.topology.node.apps" },
  { position: [0.2, -0.57], label: "xila.topology.node.vfs" },
  { position: [-0.28, 0.7], label: "xila.topology.node.lvgl" },
];

/** Pairs of indices into `NODES`. */
export const EDGES: ReadonlyArray<readonly [from: number, to: number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [1, 4],
  [1, 5],
  [4, 2],
  [5, 3],
];

/** Clip-space point to percentages of the scene box (left, top). */
export function toPercent([x, y]: Point): { left: number; top: number } {
  return {
    left: Math.round(((x + 1) / 2) * 1000) / 10,
    top: Math.round(((1 - y) / 2) * 1000) / 10,
  };
}
