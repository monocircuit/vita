import zod from "zod";
import { $Timestamps } from "@/utils/supabase/api/tables/_mapping";

/* Schemas */
export const o$VitaShardsDynamic = zod
  .object({
    id: zod.string().describe("unique identifier of the vita fragment"),
    vita_id: zod.number().describe("unique identifier of the vita"),
    chronicle_id: zod.string().describe("unique identifier of the chronicle"),

    prev_id: zod.number().nullable().describe("previous fragment in the vita"),
    next_id: zod.number().nullable().describe("next fragment in the vita"),

    y: zod.number().describe("y position of the fragment in the vita"),
    x: zod
      .array(zod.number())
      .max(2)
      .describe("x positions of the fragment in the vita"),
  })
  .merge($Timestamps);

export const i$VitaShardsDynamic = o$VitaShardsDynamic.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

/* Types */
export type oTVitaFragmentDynamic = zod.infer<typeof o$VitaShardsDynamic>;
export type iTVitaFragmentDynamic = zod.infer<typeof i$VitaShardsDynamic>;
