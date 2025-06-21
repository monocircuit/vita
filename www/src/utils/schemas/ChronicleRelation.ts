import zod from "zod";
import { $ChronicleOrientation } from "./enumerated-types/ChronicleOrientation";

/** Schemas */
export const $ChronicleRelationOverhead = zod.object({
  id: zod.string({ required_error: "ID is required" }),
});

export const $ChronicleRelation = zod.object({
  ancestor_id: zod.string({
    description:
      "The ancestor or parent ChronicleRelation of this ChronicleRelation.",
  }),

  orientation: $ChronicleOrientation,

  created_at: zod.date(),
  updated_at: zod.date(),
});

/** Types */
export type ChronicleRelation = zod.infer<typeof $ChronicleRelation>;
export type ChronicleRelationOverhead = zod.infer<
  typeof $ChronicleRelationOverhead
>;
