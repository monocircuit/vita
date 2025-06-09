import zod from "zod";

const ChronicleOrientation = zod.enum(["above", "below", "neutral"]);

export default ChronicleOrientation;
