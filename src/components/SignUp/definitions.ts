import zod from "zod";

export const SignUpFormSchema = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});
