"use client";

import { createClient } from "@/utils/supabase/client";

/**
 * @author ChatGPT5
 *
 * Fetch chronicles by user_id.
 */
export async function fetchByUser(userId: string): Promise<any[]> {
  const { data, error } = await createClient()
    .from("chronicles")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}
