"use client";

import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { z, ZodType } from "zod";

export interface signInFormData {
  email: string;
  password: string;
}

export const signInSchema: ZodType<signInFormData> = z.object({
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email({ message: "Email no Email!" }),
  password: z.string({ required_error: "Password is required!" }),
});

export const signIn = async (formData: signInFormData) => {
  const supabase = await createClient();

  const email = formData.email;
  const password = formData.password;
  if (email && password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email as string,
        password: password as string,
      });

      console.log(data);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
    }
    if (!!(await supabase.auth.getUser()).data.user) {
      redirect("/dashboard");
    }
  }
};
