import zod from "zod";

/** Schemas */
export const $EntityOverhead = zod.object({
  /** BigInt: int8 */
  id: zod.number({ required_error: "ID is required" }),
});

const $Entity = zod.object({
  name: zod.string(),
  address_id: zod.string(),

  avatar_url: zod.string().optional(),

  created_at: zod.date(),
  updated_at: zod.date(),
});

export default $Entity;

/** Types */
export type Entity = zod.infer<typeof $Entity>;
export type EntityOverhead = zod.infer<typeof $EntityOverhead>;
