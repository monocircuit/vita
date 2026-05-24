import { Coordinates } from "@/vendor/utilities/types";

interface KDNode {
  point: Coordinates;
  index: number;
  left: KDNode | null;
  right: KDNode | null;
  splitAxis: 0 | 1;
}

export interface KDTree {
  root: KDNode | null;
  nearest(
    query: Coordinates,
    offset: Coordinates,
  ): { point: Coordinates; dist: number; index: number };
}

/**
 * Builds a 2D KD-tree and provides nearest-neighbor lookup with an offset.
 *
 * @param points - Input points in local coordinates.
 * @returns A KD-tree with a `nearest` query function.
 *
 * @author Lukas Diegelmann
 */
export function buildKDTree(points: Coordinates[]): KDTree {
  const indexed = points.map((point, index) => ({ point, index }));

  function build(
    items: Array<{ point: Coordinates; index: number }>,
    depth: number,
  ): KDNode | null {
    if (items.length === 0) return null;

    const axis: 0 | 1 = (depth % 2) as 0 | 1;
    items.sort((a, b) => (axis === 0 ? a.point.x - b.point.x : a.point.y - b.point.y));

    const mid = Math.floor(items.length / 2);
    const node = items[mid];

    return {
      point: node.point,
      index: node.index,
      splitAxis: axis,
      left: build(items.slice(0, mid), depth + 1),
      right: build(items.slice(mid + 1), depth + 1),
    };
  }

  const root = build(indexed, 0);

  function nearest(query: Coordinates, offset: Coordinates) {
    let bestDist = Number.POSITIVE_INFINITY;
    let bestPoint: Coordinates = { x: 0, y: 0 };
    let bestIndex = -1;

    function search(node: KDNode | null): void {
      if (!node) return;

      const px = node.point.x + offset.x;
      const py = node.point.y + offset.y;
      const d = Math.hypot(query.x - px, query.y - py);

      if (d < bestDist) {
        bestDist = d;
        bestPoint = { x: px, y: py };
        bestIndex = node.index;
      }

      const axis = node.splitAxis;
      const queryVal = axis === 0 ? query.x : query.y;
      const nodeVal =
        (axis === 0 ? node.point.x : node.point.y) + (axis === 0 ? offset.x : offset.y);
      const diff = queryVal - nodeVal;

      const near = diff < 0 ? node.left : node.right;
      const far = diff < 0 ? node.right : node.left;

      search(near);
      if (Math.abs(diff) < bestDist) search(far);
    }

    search(root);
    return { point: bestPoint, dist: bestDist, index: bestIndex };
  }

  return { root, nearest };
}
