"use client";

import { z } from "zod";
import { createClient } from "../../../shared/data/client";
import { mapAuthError } from "@/components/SignIn/functions/mapAuthError";

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Must include uppercase, lowercase, a number, and a special character",
        },
      ),
    passwordconfirm: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.passwordconfirm, {
    message: "Passwords do not match",
    path: ["passwordconfirm"],
  });

export type resetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const updatePassword = async (
  password: string,
): Promise<{ error?: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: mapAuthError(error) };
    return {};
  } catch (error) {
    return { error: mapAuthError(error) };
  }
};
