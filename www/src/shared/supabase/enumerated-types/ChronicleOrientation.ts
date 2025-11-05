import zod from "zod";

/** Schemas */
export const $ChronicleOrientation = zod.enum(["above", "below", "neutral"]);

/** Types */
export type ChronicleOrientation = zod.infer<typeof $ChronicleOrientation>;
