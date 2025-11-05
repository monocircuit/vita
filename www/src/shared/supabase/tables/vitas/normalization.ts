import { MaritalStatus } from "../../enumerated-types/MaritalStatus";
import { oTVita } from "./mapping";

/**
 * Normalizes a raw Supabase `profiles` table row into a typed `oTProfile` object.
 *
 * This function:
 * - Converts snake_case DB fields to camelCase app fields
 * - Parses date strings into `Date` objects
 * - Applies explicit type casts for enums and nullable fields
 *
 * @param row - The raw database row (Supabase response).
 * @returns A normalized `oTProfile` ready for use in the app.
 */
export const normalizeVita = (row: any): oTVita => ({
  id: String(row.id),
  userId: String(row.user_id),

  name: String(row.name),
  type: String(row.type) as oTVita["type"],
  scope: String(row.scope) as oTVita["scope"],

  createdAt: row.created_at ? new Date(row.created_at as string) : null,
  updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
});
