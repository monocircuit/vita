"use client";

import { createClient } from "@/utils/supabase/client";
import { normalizeChronicle } from "../normalization";
import type { oTChronicle } from "../../mapping";

/**
 * @author ChatGPT5
 *
 * Fetches all chronicles belonging to the currently authenticated user.
 *
 * Returns `null` if:
 *   - no authenticated user is found, or
 *   - the user has no chronicles.
 *
 * Throws if:
 *   - a Supabase/network/auth error occurs.
 */
export async function fetchOwn(): Promise<{
  userId: string;
  chronicles: oTChronicle[];
} | null> {
  const client = createClient();

  // Aktuellen User abrufen
  const { data: userRes, error: userErr } = await client.auth.getUser();
  if (userErr) throw userErr;

  const userId = userRes.user?.id;
  if (!userId) {
    // Kein eingeloggter Benutzer → kein Fehler, nur leerer Zustand
    return null;
  }

  // Alle Chronicles des Users abrufen
  const { data, error } = await client
    .from("chronicles")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  if (!data || data.length === 0) {
    // Keine Einträge gefunden → leerer Zustand
    return null;
  }

  // Normalisieren & zurückgeben
  const chronicles = data.map(normalizeChronicle);
  return { userId, chronicles };
}
