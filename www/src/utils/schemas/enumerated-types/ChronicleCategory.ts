import zod from "zod";

/** Schemas */
export const $ChronicleCategory = zod.enum([
  "education",
  "internship",
  "work experience",
]);

/** Types */
export type ChronicleCategory = zod.infer<typeof $ChronicleCategory>;
