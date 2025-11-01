"use client";

import { createClient } from "@/utils/supabase/client";

export async function fetchById(id: string): Promise<any | null> {
  const { data, error } = await createClient()
    .from("chronicles")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}
