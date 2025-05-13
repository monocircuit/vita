"use server";

import { createClient } from "@/utils/supabase/server";

export interface SignInFormData {
  username: string;
  password: string;
}

export async function signup(state, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("username");
  const password = formData.get("password");

  if (email && password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email as string,
        password: password as string,
      });

      console.log(data);

      throw error;
    } catch (error) {
      console.log(error);
    }
  }
}
