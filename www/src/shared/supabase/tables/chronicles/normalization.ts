import { ChronicleCategory } from "../../enumerated-types/ChronicleCategory";
import { Scope } from "../../enumerated-types/Scope";
import type { oTChronicle } from "./mapping";

/**
 * Normalizes a raw Supabase `chronicles` table row into a typed `oTChronicle` object.
 *
 * This function:
 * - Ensures all IDs are strings
 * - Converts date strings to `Date` objects
 * - Converts string arrays (like `knots`) into timestamp numbers
 * - Provides type safety and defaults for missing data
 *
 * @param row - The raw database row (untyped Supabase response).
 * @returns A normalized `oTChronicle` ready for use in the app.
 */
export const normalizeChronicle = (row: any): oTChronicle => ({
  id: String(row.id),
  entityId: String(row.entity_id),
  userId: String(row.user_id),

  title: row.title as string,
  description: row.description as string,

  scope: row.scope as Scope,
  category: row.category as ChronicleCategory,

  knots: Array.isArray(row.knots)
    ? row.knots.map((k: string) => Date.parse(k))
    : [],

  createdAt: row.created_at ? new Date(row.created_at as string) : null,
  updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
});
