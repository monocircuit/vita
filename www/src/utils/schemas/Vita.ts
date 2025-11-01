import zod from "zod";
import { $VitaType } from "../supabase/enumerated-types/VitaType";

/* Schemas */
export const $Vita = zod.object({
  id: zod
    .number({ required_error: "The id field is required" })
    .describe("unique identifier of the vita"),
  user_id: zod
    .string({ required_error: "The user_id field is required" })
    .describe("unique identifier of the user"),
  name: zod
    .string({ required_error: "The name field is required" })
    .describe("name of the vita"),
  type: $VitaType,
});

/* Types */
export type TVita = zod.infer<typeof $Vita>;
