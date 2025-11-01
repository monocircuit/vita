import zod from "zod";
import { $MaritalStatus } from "../supabase/enumerated-types/MaritalStatus";

/** Schemas */
export const $ProfileOverhead = zod.object({
  id: zod
    .string({ required_error: "ID is required" })
    .describe("unique identifier of the user profile"),
});

export const $Profile = zod.object({
  id: zod
    .string({ required_error: "ID is requiered" })
    .describe("unique identifier of the user profile"),

  firstName: zod.string().describe("first name of the user").optional(),
  lastName: zod.string().describe("last name of the user").optional(),

  dayOfBirth: zod.date().describe("date of birth of the user").optional(),
  maritalStatus: $MaritalStatus.optional(),

  avatarUrl: zod
    .string()
    .describe("URL to the profile picture of the user")
    .optional(),
});

/** Types */
export type Profile = zod.infer<typeof $Profile>;
export type ProfileOverhead = zod.infer<typeof $ProfileOverhead>;
