"use server";

import { User, Session } from "@supabase/supabase-js";

import { createClient } from "@/shared/data/server";

import { SignUpFormSchema } from "./definitions";

export interface SignInFormData {
  username: string;
  password: string;
}

export async function signup(
  state: { user: User; session: Session },
  formData: FormData,
) {
  const supabase = await createClient();

  const validationResult = SignUpFormSchema.safeParse({
    email: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    throw validationResult.error;
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
}
