import zod from "zod";
import ChronicleCategory from "@/utils/schemas/enumerated-types/ChronicleCategory";

const Chroncile = zod.object({
  id: zod.number({
    description:
      "Unique identifier for the Chronicle. Automatically generated.",
  }),
  user_id: zod.string({
    description: "References the user (auth.users) who created the Chronicle.",
  }),

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

  category: ChronicleCategory,
});

export default Chroncile;
