import zod from "zod";
import { $VitaType } from "@/utils/supabase/enumerated-types/VitaType";
import { $Scope } from "../../enumerated-types/Scope";

/* Schemas */
export const o$Vita = zod.object({
  id: zod
    .number({ required_error: "The id field is required" })
    .describe("unique identifier of the vita"),
  user_id: zod
    .string({ required_error: "The user_id field is required" })
    .describe("unique identifier of the user, fallback is the current user")
    .optional(),
  name: zod
    .string({ required_error: "The name field is required" })
    .describe("name of the vita"),
  type: $VitaType,
  scope: $Scope,
});

export type oTVita = zod.infer<typeof o$Vita>;

export const i$Vita = o$Vita.omit({
  id: true,
});

export type iTVita = zod.infer<typeof i$Vita>;
