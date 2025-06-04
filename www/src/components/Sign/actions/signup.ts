"use server";

import { User, Session } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/server";
import SignUpFormSchema from "@/components/Sign/schemas/SignInFormSchema";
import zod, { ZodError } from "zod";

const signup = async (
  state:
    | {
        user: User;
        session: Session;
      }
    | ZodError<zod.infer<typeof SignUpFormSchema>>,
  formData: FormData,
) => {
  const supabase = await createClient();

  const validationResult = SignUpFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    return { error: validationResult.error };
  }

  if (validationResult.data.email && validationResult.data.password) {
    try {
      const { data } = await supabase.auth.signUp({
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      console.log(data);

      return data;
    } catch (error) {
      console.log(error);
    }
  }
};

export default signup;
