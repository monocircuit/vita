"use server";

import { User, Session } from "@supabase/supabase-js";

import { createClient } from "@/shared/data/server";
import SignUpFormSchema from "@/components/features/Sign/schemas/SignInFormSchema";

export interface SignUpActionState {
  user: User | null;
  session: Session | null;
  error: string | null;
}

const signup = async (
  _state: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> => {
  const supabase = await createClient();

  const validationResult = SignUpFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    return {
      user: null,
      session: null,
      error:
        validationResult.error.issues[0]?.message ?? "Ungueltige Eingaben.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: validationResult.data.email,
      password: validationResult.data.password,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: error.message,
      };
    }

    return {
      user: data.user ?? null,
      session: data.session ?? null,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error:
        error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.",
    };
  }
};

export default signup;
