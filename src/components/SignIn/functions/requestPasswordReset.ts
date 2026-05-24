"use client";

import { createClient } from "../../../shared/data/client";
import { mapAuthError } from "./mapAuthError";

export const requestPasswordReset = async (
  email: string,
): Promise<{ error?: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: mapAuthError(error) };
    return {};
  } catch (error) {
    return { error: mapAuthError(error) };
  }
};
