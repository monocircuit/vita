import zod from "zod";

const SignUpFormSchema = zod.object({
  email: zod.string().email(),
  password: zod
    .string()
    .min(8, { message: "Password is too short! (minimum is 8 characters)" }),
});

export default SignUpFormSchema;
