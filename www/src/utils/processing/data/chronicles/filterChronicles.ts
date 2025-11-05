import {
  iTChronicle,
  iTLinearChronicle,
  iTUntiedChronicle,
  o$UntiedChronicle,
  oTChronicle,
  oTLinearChronicle,
  oTUntiedChronicle,
} from "@/shared/supabase/tables/chronicles/mapping";

type InputChronicle = iTChronicle | oTChronicle;
type ResultFor<T extends InputChronicle> = T extends oTChronicle
  ? { linear: oTLinearChronicle[]; untied: oTUntiedChronicle[] }
  : { linear: iTLinearChronicle[]; untied: iTUntiedChronicle[] };

/**
 * @author Lukas Diegelmann
 *
 * Filters and normalizes a list of chronicles into two separate categories:
 *  - **Linear Chronicles:** chronicles that can be represented by a start and end knot (time range)
 *  - **Static Chronicles:** chronicles without knots (i.e. timeless/static entries)
 *
 * This function ensures that each chronicle is parsed and transformed into a consistent
 * shape usable by downstream components (e.g., the rendering engine).
 *
 * ---
 * ### Behavior:
 * - Chronicles with **0 knots** → classified as *static chronicles* and validated with Zod (`o$StaticChronicle`).
 * - Chronicles with **2 knots** → converted into a *single linear chronicle* with `start` and `end` timestamps.
 * - Chronicles with **>2 knots** → *split* into multiple linear chronicles, each representing a pair of consecutive knots.
 *   - If an odd number of knots exists, the last one is paired with `Infinity` as its `end` value (indicating “open-ended”).
 *
 * Each resulting linear chronicle includes a unique derived ID (`<originalId>-<index>`) to preserve distinct entries.
 *
 * ---
 * ### Example:
 * ```ts
 * const { linear, static } = filterChronicles(chronicles);
 * console.log(linear); // → chronicle segments with start/end knots
 * console.log(static); // → timeless static chronicles
 * ```
 *
 * @param chronicles - The raw list of chronicles to process (mixed static and linear forms)
 * @returns An object containing:
 *  - `linear`: normalized array of {@link oTLinearChronicle}
 *  - `static`: array of validated {@link oTUntiedChronicles}
 */
const filterChronicles = <T extends InputChronicle>(
  chronicles: T[],
): ResultFor<T> => {
  const linearChronicles: any[] = [];
  const untiedChronicles: any[] = [];

  chronicles.forEach(chronicle => {
    // untied chronicle (no time-based data)
    if (chronicle.knots.length == 0) {
      untiedChronicles.push(
        // Parse with Zod to enforce correct runtime structure
        o$UntiedChronicle.parse(chronicle),
      );
    }

    // Exactly two knots → a single linear chronicle
    else if (chronicle.knots.length == 2) {
      linearChronicles.push({
        ...chronicle,
        knots: {
          // Use .getTime() to make timestamps comparable numerically
          start: chronicle.knots[0],
          end: chronicle.knots[1],
        },
      });
    }

    // More than two knots → split into consecutive pairs
    else if (chronicle.knots.length > 2) {
      let i = 0;

      // Group knots into pairs
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

      // If there’s an unpaired final knot → add an open-ended chronicle
      if (i == chronicle.knots.length - 1) {
        linearChronicles.push({
          ...chronicle,
          knots: {
            start: chronicle.knots[i],
            end: Infinity, // Represents ongoing/undefined end
          },
        });
      }
    }
  });

  return {
    linear: linearChronicles,
    untied: untiedChronicles,
  } as ResultFor<T>;
};

export default filterChronicles;
