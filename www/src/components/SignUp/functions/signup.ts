"use client";

import { createClient } from "../../../shared/supabase/client";
import { z, ZodType } from "zod";

export interface signUpFormData {
  email: string;
  password: string;
  passwordconfirm: string;
}

export const signUpSchema: ZodType<signUpFormData> = z
  .object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({ message: "Email no Email!" }),
    password: z
      .string({ required_error: "Password is required!" })
      .min(8, { message: "Too Short" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "One LowerCase, One UpperCase, one Number, one Special Character",
        },
      ),
    passwordconfirm: z.string({ required_error: "Password is required!" }),
  })
  .refine(data => data.password === data.passwordconfirm, {
    message: "Passwords do not match",
    path: ["passwordconfirm"],
  });

export const signUp = async (formData: signUpFormData) => {
  const supabase = await createClient();

  const email = formData.email;
  const password = formData.password;
  const passwordConfirm = formData.passwordconfirm;

  if (email && password && passwordConfirm) {
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
};
