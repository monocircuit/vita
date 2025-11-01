import zod from "zod";

/* Schemas */
export const $Timestamps = zod.object({
  created_at: zod.date().describe("timestamp of creation"),
  updated_at: zod.date().describe("timestamp of last update"),
});

/* Types */
export type TTimestamps = zod.infer<typeof $Timestamps>;
