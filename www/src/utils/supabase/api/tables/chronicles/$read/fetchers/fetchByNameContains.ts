"use client";

import { createClient } from "@/utils/supabase/client";

/**
 * @author ChatGPT5
 *
 * Fetch chronicles whose `name` contains the given term (case-insensitive).
 */
export async function fetchByNameContains(name: string): Promise<any[]> {
  const { data, error } = await createClient()
    .from("chronicles")
    .select("*")
    .ilike("name", `%${name}%`);
  if (error) throw error;
  return data ?? [];
}
