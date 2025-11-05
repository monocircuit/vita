import zod from "zod";
import { $Timestamps } from "@/shared/supabase/mapping";

/* Schemas */
export const o$DynamicShard = zod
  .object({
    id: zod.string().describe("unique identifier of the vita fragment"),
    vitaId: zod.string().describe("unique identifier of the vita"),
    chronicleId: zod.string().describe("unique identifier of the chronicle"),

    prevId: zod.string().nullable().describe("previous fragment in the vita"),
    nextId: zod.string().nullable().describe("next fragment in the vita"),

    y: zod.number().describe("y position of the fragment in the vita"),
    x: zod
      .array(zod.number())
      .max(2)
      .describe("x positions of the fragment in the vita"),
  })
  .merge($Timestamps);

export const i$DynamicShard = o$DynamicShard.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/* Types */
export type oTDynamicShard = zod.infer<typeof o$DynamicShard>;
export type iTDynamicShard = zod.infer<typeof i$DynamicShard>;
