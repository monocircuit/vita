import zod from "zod";

/* Schemas */
export const $Timestamps = zod.object({
  createdAt: zod.date().describe("timestamp of creation").nullable(),
  updatedAt: zod.date().describe("timestamp of last update").nullable(),
});

/* Types */
export type TTimestamps = zod.infer<typeof $Timestamps>;
