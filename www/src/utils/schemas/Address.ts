import zod from "zod";

const Address = zod.object({
  id: zod.number({ required_error: "ID is required" }),
  street_name: zod.string(),
  house_number: zod.string(),
  postal_code: zod.string(),
  city: zod.string(),
  state: zod.string(),
  country: zod.string(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

export default Address;
