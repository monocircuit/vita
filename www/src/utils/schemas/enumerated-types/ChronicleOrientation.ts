import zod from "zod";

/** Schemas */
const $ChronicleOrientation = zod.enum(["above", "below", "neutral"]);

export default $ChronicleOrientation;

/** Types */
export type ChronicleOrientation = zod.infer<typeof $ChronicleOrientation>;
