import zod from "zod";

/** Schemas */
export const $AddressOverhead = zod.object({
  id: zod.number({ required_error: "ID is required" }),
});

export const $Address = zod.object({
  street_name: zod.string(),
  house_number: zod.string(),
  postal_code: zod.string(),
  city: zod.string(),
  state: zod.string(),
  country: zod.string(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

/** Types */
export type Address = zod.infer<typeof $Address>;
export type AddressOverhead = zod.infer<typeof $AddressOverhead>;
