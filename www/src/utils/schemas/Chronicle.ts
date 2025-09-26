import zod from "zod";
import { $ChronicleCategory } from "@/utils/schemas/enumerated-types/ChronicleCategory";
import { $Scope } from "./enumerated-types/Scope";

/**
 * Everything that is tagged with the suffix `Overhead` is the additional information
 * that is comes when GETTING data from supabase. When PUTTING data into supabase the
 * `Overhead` is not needed.
 *
 * The default type is the type combined with its `Overhead` counterpart, in order to
 * omit the `Overhead` when writing PUT functions, one can use the Omit<> helper of
 * typescript.
 */

/** Schemas */
export const $ChronicleOverhead = zod.object({
  id: zod.number({
    description:
      "Unique identifier for the Chronicle. Automatically generated.",
  }),
  user_id: zod.string({
    description: "References the user (auth.users) who created the Chronicle.",
  }),
});

export const $Chroncile = zod
  .object({
    entity_id: zod.string({
      description:
        "The entity this Chronicle is connected with or was achieved with.",
    }),
    title: zod.string({
      description: "The title or name of the Chronicle.",
    }),
    description: zod.string({
      description:
        "Detailed description or additional information about the Chronicle.",
    }),
    knots: zod
      .array(zod.number())
      .describe(
        "List of dates representing anchor points for the rendering of the Chronicle.",
      ),
    category: $ChronicleCategory,
    scope: $Scope,
  })
  .merge($ChronicleOverhead);

export const $LinearChronicleKnots = zod.object({
  start: zod.number(),
  end: zod.number(),
});

export const $LinearChronicle = $Chroncile.extend({
  knots: $LinearChronicleKnots,
});

/** Types */
export type Chronicle = zod.infer<typeof $Chroncile>;
export type ChronicleOverhead = zod.infer<typeof $ChronicleOverhead>;

export type LinearChronicleKnots = zod.infer<typeof $LinearChronicleKnots>;
export type LinearChronicle = zod.infer<typeof $LinearChronicle>;
