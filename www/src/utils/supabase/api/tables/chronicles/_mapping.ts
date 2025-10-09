import zod from "zod";
import { $ChronicleCategory } from "@/utils/supabase/api/enumerated-types/ChronicleCategory";
import { $Scope } from "../../enumerated-types/Scope";
import { $Timestamps } from "../_mapping";

/**
 * @author Lukas Diegelmann
 *
 * @description
 * This is the default chronicle schema, it represents how a chronicle is stored in the
 * database. The `o` prefix defines that this schema is used when data is outputted and
 * the `i` prefix defines that this schema is used when data is inputted. A simple
 * Chronicle contains all information about it, including things like title and description.
 */
export const o$Chronicle = zod
  .object({
    id: zod.string({
      description:
        "Unique identifier for the Chronicle. Automatically generated.",
    }),
    user_id: zod.string({
      description:
        "References the user (auth.users) who created the Chronicle.",
    }),
    entity_id: zod
      .number()
      .describe("The entity this Chronicle is connected with."),

    title: zod.string().describe("The title or name of the Chronicle."),
    description: zod
      .string()
      .describe("Detailed description of the Chronicle."),
    knots: zod.array(zod.number()).describe("List of date strings as knots."),

    category: $ChronicleCategory,
    scope: $Scope,
  })
  .merge($Timestamps);

export type oTChronicle = zod.infer<typeof o$Chronicle>;

export const i$Chroncile = o$Chronicle.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type iTChronicle = zod.infer<typeof i$Chroncile>;

/*
 * Linear/Tiedness Chronicle semantic schema extension
 */
/**
 * @author Lukas Diegelmann
 *
 * A Tied chronicle contains at least one knots, making it tied in time.
 * This schema is used for input only, since output Tied chronicles are always
 * of the type `o$TiedChronicle`.
 */
export const i$TiedChronicle = i$Chroncile.extend({
  knots: zod
    .array(zod.number())
    .describe("List of date strings as knots.")
    .min(1),
});

export type iTTiedChronicle = zod.infer<typeof i$TiedChronicle>;

/**
 * @author Lukas Diegelmann
 *
 * A Tied chronicle contains at least one knots, making it tied in time.
 * This schema is used for output only, since input Tied chronicles are always
 * of the type `i$TiedChronicle`.
 */
export const o$TiedChronicle = o$Chronicle.extend({
  knots: zod
    .array(zod.number())
    .describe("List of date strings as knots.")
    .min(1),
});

export type oTTiedChronicle = zod.infer<typeof o$TiedChronicle>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * Since an object of the type of an linear chronicle will always have two knots, it makes
 * the code more readable and understandable to have the knots names `start` and `end`.
 */
export const $LinearChronicleKnots = zod.object({
  start: zod.number(),
  end: zod.number(),
});

export type TLinearChronicleKnots = zod.infer<typeof $LinearChronicleKnots>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * This schema extends the default chronicle schema to a linear chronicle schema, making use
 * of the `LinearChronicleKnots` schema for the `knots` property.
 */
export const i$LinearChronicle = i$Chroncile.extend({
  knots: $LinearChronicleKnots,
});

export type iTLinearChronicle = zod.infer<typeof i$LinearChronicle>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * This schema extends the default chronicle schema to a linear chronicle schema, making use
 * of the `LinearChronicleKnots` schema for the `knots` property.
 */
export const o$LinearChronicle = o$Chronicle.extend({
  knots: $LinearChronicleKnots,
});

export type oTLinearChronicle = zod.infer<typeof o$LinearChronicle>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * A `UntiedChronicle` of the output type that does not contain any knot information, rendering
 * it unable to be processed by the `Engine`.
 */
export const o$UntiedChronicle = o$Chronicle.omit({ knots: true });

export type oTUntiedChronicle = zod.infer<typeof o$UntiedChronicle>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * A `UntiedChronicle` of the input type that does not contain any knot information, rendering
 * it unable to be processed by the `Engine`.
 */
export const i$UntiedChronicle = i$Chroncile.omit({ knots: true });

export type iTUntiedChronicle = zod.infer<typeof i$UntiedChronicle>;
