import zod from "zod";
import { $Timestamps } from "@/shared/supabase/mapping";
import { sqlToZod } from "@/shared/supabase/sqlToZod";

/* Schemas */
export namespace $ShardDynamic {
  export const Normalized = zod
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
    .merge($Timestamps.Normalized);

  export const Denormalized = zod.object({
    id: sqlToZod("bigint").describe("unique identifier of the vita fragment"),
    vita_id: sqlToZod("bigint").describe("unique identifier of the vita"),
    chronicle_id: sqlToZod("bigint").describe(
      "unique identifier of the chronicle",
    ),

    y: sqlToZod("smallint").describe("y position of the fragment in the vita"),
    x: sqlToZod("_int2")
      .max(2)
      .describe("x positions of the fragment in the vita"),

    prev_id: sqlToZod("bigint")
      .nullable()
      .describe("previous fragment in the vita"),
    next_id: sqlToZod("bigint")
      .nullable()
      .describe("next fragment in the vita"),
  });
}

export const $DynamicShard_normalized_read = zod
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

export const $DynamicShard_denormalized_read = zod.object({
  id: zod.string().describe("unique identifier of the vita fragment"),
  vita_id: zod.string().describe("unique identifier of the vita"),
  chronicle_id: zod.string().describe("unique identifier of the chronicle"),

  prev_id: zod.string().nullable().describe("previous fragment in the vita"),
  next_id: zod.string().nullable().describe("next fragment in the vita"),

  y: zod.number().describe("y position of the fragment in the vita"),
  x: zod
    .array(zod.number())
    .max(2)
    .describe("x positions of the fragment in the vita"),
});

export const nw$DynamicShard = $DynamicShard_normalized_read.omit({
  createdAt: true,
  updatedAt: true,
});

/* Types */
export type oTDynamicShard = zod.infer<typeof $DynamicShard_normalized_read>;
export type iTDynamicShard = zod.infer<typeof nw$DynamicShard>;
