import zod from "zod";
import Scope from "./enumerated-types/Scope";

const DynamicView = zod.object({
  id: zod.number({ required_error: "ID is required" }),

  name: zod.string(),
  chronicle_relation_id: zod.string(),

  scope: Scope,

  created_at: zod.date(),
  updated_at: zod.date(),
});

export default DynamicView;
