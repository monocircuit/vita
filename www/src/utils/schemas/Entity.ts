import zod from "zod";

const Entity = zod.object({
  id: zod.number({ required_error: "ID is required" }),

  name: zod.string(),
  address_id: zod.string(),

  avatar_url: zod.string().optional(),

  created_at: zod.date(),
  updated_at: zod.date(),
});

export default Entity;
