import { oTDynamicShard } from "./mapping";

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
export const normalizeDynamicShard = (row: any): oTDynamicShard => ({
  id: String(row.id),
  chronicleId: String(row.chronicle_id),
  nextId: String(row.next_id),
  prevId: String(row.prev_id),
  vitaId: String(row.vita_id),
  x: row.x,
  y: row.y,
  createdAt: row.created_at ? new Date(row.created_at as string) : null,
  updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
});
