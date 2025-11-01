"use client";

import { createClient } from "@/utils/supabase/client";

/**
 * @author ChatGPT5
 *
 * Fetch all chronicles.
 */
export async function fetchAll(): Promise<any[]> {
  const { data, error } = await createClient().from("chronicles").select("*");
  if (error) throw error;
  return data ?? [];
}
