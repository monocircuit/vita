import zod from "zod";
import { $Scope } from "../supabase/enumerated-types/Scope";

/** Schemas */
export const $VitaDynamicOverhead = zod.object({
  user_id: zod.number({ required_error: "ID is required" }),

  createdAt: zod.date(),
  updatedAt: zod.date(),
});

export const $VitaDynamic = zod.object({
  name: zod.string(),
  chronicleRelationId: zod.string(),

  scope: $Scope,
});

/** Types */
export type VitaDynamic = zod.infer<typeof $VitaDynamic>;
export type VitaDynamicOverhead = zod.infer<typeof $VitaDynamicOverhead>;
