import zod from "zod";
import ChronicleOrientation from "./enumerated-types/ChronicleOrientation";

zod.object({
  id: zod.number({ required_error: "ID is required" }),

  ancestor_id: zod.string({
    description:
      "The ancestor or parent ChronicleRelation of this ChronicleRelation.",
  }),

  orientation: ChronicleOrientation,

  created_at: zod.date(),
  updated_at: zod.date(),
});
