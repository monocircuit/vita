"use server";

import { createClient } from "@/utils/supabase/server";

interface SignInFormData {
  username: string;
  password: string;
}

export async function signIn(state, formData: SignInFormData) {
  const supabase = await createClient();

  console.log(state, formData);
}
