import zod from "zod";
import $ChronicleCategory from "@/utils/schemas/enumerated-types/ChronicleCategory";
import $Scope from "./enumerated-types/Scope";

/** Schemas */
export const $ChronicleOverhead = zod.object({
  id: zod.number({
    description:
      "Unique identifier for the Chronicle. Automatically generated.",
  }),
  user_id: zod.string({
    description: "References the user (auth.users) who created the Chronicle.",
  }),
});

const $Chroncile = zod.object({
  entity_id: zod.string({
    description:
      "The entity this Chronicle is connected with or was achieved with.",
  }),
  title: zod.string({
    description: "The title or name of the Chronicle.",
  }),
  description: zod.string({
    description:
      "Detailed description or additional information about the Chronicle.",
  }),
  knots: zod
    .date()
    .describe(
      "List of dates representing anchor points for the rendering of the Chronicle.",
    )
    .optional(),

  category: $ChronicleCategory,
  scope: $Scope,
});

export default $Chroncile;

/** Types */
export type Chronicle = zod.infer<typeof $Chroncile>;
export type ChronicleOverhead = zod.infer<typeof $ChronicleOverhead>;
