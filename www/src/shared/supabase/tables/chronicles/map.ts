import zod from "zod";
import createZodSchemaFromTable, {
  InferZodTableSchema,
} from "../../createZodSchemaFromTable";

export const { $Chronicles } = await createZodSchemaFromTable(
  "chronicles",
  raw => ({
    knots: raw.knots.map(knot => new Date(knot).getTime()),
  }),
);

export type Chronicles = InferZodTableSchema<typeof $Chronicles>;

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
export const $TiedChronicle = $Chronicles.Normalized._def.schema.extend({
  knots: zod
    .array(zod.number())
    .describe("List of date strings as knots.")
    .min(1),
});

export type TiedChronicle = zod.infer<typeof $TiedChronicle>;

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

export type LinearChronicleKnots = zod.infer<typeof $LinearChronicleKnots>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * This schema extends the default chronicle schema to a linear chronicle schema, making use
 * of the `LinearChronicleKnots` schema for the `knots` property.
 */
export const $LinearChronicle = $Chronicles.Normalized._def.schema.extend({
  knots: $LinearChronicleKnots,
});

export type LinearChronicle = zod.infer<typeof $LinearChronicle>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * A `UntiedChronicle` of the output type that does not contain any knot information, rendering
 * it unable to be processed by the `Engine`.
 */
export const $UntiedChronicle = $Chronicles.Normalized._def.schema.omit({
  knots: true,
});

export type UntiedChronicle = zod.infer<typeof $UntiedChronicle>;
