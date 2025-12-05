import { Bridge } from "@/shared/bridge";

/*
 * Export all hooks
 */
export { default as useOwnChronicles } from "./useOwnChronicles";
export { default as useChroniclesByUserId } from "./useChroniclesByUserId";

/**
 * Converts a chronicle with knots array to linear chronicle segments.
 * Extracted as a standalone function to allow reuse without circular dependencies.
 */
function toLinearChronicles<T extends { knots: number[]; id: number | string }>(
  chronicle: T,
) {
  type LinearChronicle = Overwrite<
    T,
    { knots: { start: number; end: number } }
  >;
  const linearChronicles: LinearChronicle[] = [];

  if (!chronicle.knots || chronicle.knots.length === 0) return linearChronicles;

  if (chronicle.knots.length === 2) {
    linearChronicles.push({
      ...chronicle,
      knots: {
        start: chronicle.knots[0],
        end: chronicle.knots[1],
      },
    });
    return linearChronicles;
  }

  let i = 0;
  while (i < chronicle.knots.length - 1) {
    linearChronicles.push({
      ...chronicle,
      knots: {
        start: chronicle.knots[i],
        end: chronicle.knots[i + 1],
      },
    });
    i += 2;
  }

  if (i === chronicle.knots.length - 1) {
    linearChronicles.push({
      ...chronicle,
      knots: {
        start: chronicle.knots[i],
        end: Infinity,
      },
    });
  }

  return linearChronicles;
}

export const chronicles = Bridge.Table.create("chronicles")
  .column("knots")
  .normalize(knots => knots.map(knot => new Date(knot).getTime()))
  .denormalize(knots => knots.map(knot => new Date(knot).toISOString()))
  .mutations({
    untied: {
      removedKeys: ["knots"],
    },
    linear: {
      to: chronicle => toLinearChronicles(chronicle),
      from: segments => {
        if (!segments || segments.length === 0) {
          throw new Error(
            "Cannot reconstruct Chronicle from empty LinearChronicle[]",
          );
        }

        const base = segments[0];
        const allKnots: number[] = [];
        for (const seg of segments) {
          allKnots.push(seg.knots.start);
          if (Number.isFinite(seg.knots.end)) {
            allKnots.push(seg.knots.end as number);
          }
        }

        return {
          ...base,
          knots: allKnots,
        };
      },
    },
    engine: {
      to: chronicle => {
        // Use the extracted function directly to avoid circular $Schemas reference
        const linears = toLinearChronicles(chronicle);
        return linears.map(linear => ({ knots: linear.knots, id: linear.id }));
      },
    },
  });
