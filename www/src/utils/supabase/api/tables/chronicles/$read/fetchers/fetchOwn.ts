"use client";

import { createClient } from "@/utils/supabase/client";
import { fetchByUser } from "./fetchByUser";

/**
 * @author ChatGPT5
 *
 * Fetch chronicles for current authenticated user.
 */
export async function fetchOwn(): Promise<{
  userId: string | null;
  chronicles: any[];
}> {
  const { data: ures, error: uerr } = await createClient().auth.getUser();
  if (uerr) throw uerr;
  const userId = ures.user?.id ?? null;
  if (!userId) return { userId: null, chronicles: [] };
  const chronicles = await fetchByUser(userId);
  return { userId, chronicles };
}
