"use client";

import { createClient } from "@/utils/supabase/client";

/**
 * @author ChatGPT5
 *
 * Fetch chronicles by type (optional column).
 */
export async function fetchByType(type: string): Promise<any[]> {
  const { data, error } = await createClient()
    .from("chronicles")
    .select("*")
    .eq("type", type);
  if (error) throw error;
  return data ?? [];
}
