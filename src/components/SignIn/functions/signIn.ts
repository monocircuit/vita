"use client";

import { redirect } from "next/navigation";
import { createClient } from "../../../shared/data/client";
import { z } from "zod";
import { mapAuthError } from "./mapAuthError";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required!" }),
});

export type signInFormData = z.infer<typeof signInSchema>;

export const signIn = async (formData: signInFormData): Promise<{ error?: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) return { error: mapAuthError(error) };
  } catch (error) {
    return { error: mapAuthError(error) };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return { error: mapAuthError(null) };
};
