import { Coordinates } from "@/vendor/utilities/types";

import { KDTree } from "./kdtree";

export interface CoordinatesPair {
  a: Coordinates;
  b: Coordinates;
  normalA?: Coordinates;
  normalB?: Coordinates;
}

/**
 * Finds a close coordinate pair between two point sets represented by KD-trees.
 *
 * The function alternates nearest-neighbor lookups between tree A and tree B
 * for a small number of refinement steps.
 *
 * @param treeA - KD-tree for set A.
 * @param treeB - KD-tree for set B.
 * @param offsetA - World offset for points in set A.
 * @param offsetB - World offset for points in set B.
 * @returns A refined closest coordinate pair.
 *
 * @author Lukas Diegelmann
 */
export function findClosestCoordinatesPair(
  treeA: KDTree,
  treeB: KDTree,
  offsetA: Coordinates,
  offsetB: Coordinates,
): CoordinatesPair {
  let candidateB = treeB.nearest({ x: offsetA.x + 100, y: offsetA.y + 100 }, offsetB);
  let candidateA = treeA.nearest(candidateB.point, offsetA);

  for (let i = 0; i < 3; i++) {
    const nextB = treeB.nearest(candidateA.point, offsetB);
    if (nextB.index === candidateB.index) break;
    candidateB = nextB;

    const nextA = treeA.nearest(candidateB.point, offsetA);
    if (nextA.index === candidateA.index) break;
    candidateA = nextA;
  }

  return { a: candidateA.point, b: candidateB.point };
}