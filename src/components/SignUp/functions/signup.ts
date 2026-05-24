"use client";

import { createClient } from "../../../shared/data/client";
import { z } from "zod";
import { mapAuthError } from "@/components/SignIn/functions/mapAuthError";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required!" })
      .email({ message: "Invalid email address" }),
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
    passwordconfirm: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine(data => data.password === data.passwordconfirm, {
    message: "Passwords do not match",
    path: ["passwordconfirm"],
  });

export type signUpFormData = z.infer<typeof signUpSchema>;

export const signUp = async (formData: signUpFormData): Promise<{ error?: string; success?: boolean }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) return { error: mapAuthError(error) };
    return { success: true };
  } catch (error) {
    return { error: mapAuthError(error) };
  }
};
