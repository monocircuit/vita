import zod from "zod";
import { $MaritalStatus } from "@/shared/supabase/enumerated-types/MaritalStatus";
import { $Timestamps } from "@/shared/supabase/mapping";

/**
 * @author Lukas Diegelmann
 *
 * @description
 * Mapping for the `profiles` table as shown in the screenshot.
 *
 * Conventions:
 *  - Schemas prefixed with `o` are used for *output* (what comes from the DB/API)
 *  - Schemas prefixed with `i` are used for *input* (what we accept/send to the DB/API)
 *  - Common timestamp fields are merged in via `$Timestamps` (`created_at`, `updated_at`).
 */
export const o$Profile = zod
  .object({
    id: zod.string({ description: "Primary key UUID for the profile." }).uuid(),

    firstName: zod
      .string({ description: "First name of the user." })
      .nullable(),

    lastName: zod.string({ description: "Last name of the user." }).nullable(),

    avatarUrl: zod
      .string({ description: "Public URL to the user avatar image." })
      .nullable(),

    dayOfBirth: zod
      .date()
      .describe("Birth date as JavaScript Date object (converted by fetcher).")
      .nullable(),

    maritalStatus: $MaritalStatus
      .describe("Marital status enum value.")
      .nullable(),
  })
  .merge($Timestamps);

export type oTProfile = zod.infer<typeof o$Profile>;

export const i$Profile = o$Profile.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type iTProfile = zod.infer<typeof i$Profile>;
