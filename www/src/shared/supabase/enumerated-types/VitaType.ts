import zod from "zod";

/** Schemas */
export const $VitaType = zod
  .enum(["DYNAMIC", "STATIC"])
  .describe("type of the vita");

/** Types */
export type TVitaType = zod.infer<typeof $VitaType>;
