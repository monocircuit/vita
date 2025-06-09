import zod from "zod";

/** Schemas */
const $ChronicleCategory = zod.enum([
  "education",
  "internship",
  "work experience",
]);

export default $ChronicleCategory;

/** Types */
export type ChronicleCategory = zod.infer<typeof $ChronicleCategory>;
