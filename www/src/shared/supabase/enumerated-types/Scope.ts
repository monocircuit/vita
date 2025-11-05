import zod from "zod";

/** Schemas */
export const $Scope = zod
  .enum(["public", "private", "restricted"])
  .describe(
    "Scope of the resource, indicating its visibility and access level. Options include public (accessible to everyone), private (accessible only to the owner), or restricted (accessible to a specific group or under certain conditions).",
  );

/** Type */
export type Scope = zod.infer<typeof $Scope>;
