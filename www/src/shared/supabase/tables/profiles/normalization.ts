import { MaritalStatus } from "../../enumerated-types/MaritalStatus";
import { oTProfile } from "./mapping";

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
export const normalizeProfile = (row: any): oTProfile => ({
  id: row.id as string,
  firstName: row.first_name as string,
  lastName: row.last_name as string,
  maritalStatus: row.marital_status as MaritalStatus,
  avatarUrl: row.avatar_url as string,
  dayOfBirth: row.day_of_birth ? new Date(row.day_of_birth as string) : null,
  createdAt: row.created_at ? new Date(row.created_at as string) : null,
  updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
});
