"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/supabase/client";

/**
 * makeOwnWriter: Wraps a writer hook factory so it automatically injects
 * the current authenticated user's id into the defaults.
 *
 * @example
 * ```ts
 * // Base writer that requires user_id
 * const useWriteChroniclesByUserId = (userId: string) =>
 *   TanstackWriter
 *     .create("chronicles")
 *     .withDefaults({ user_id: userId })
 *     .build()();
 *
 * // Wrapped writer that auto-injects current user
 * const useWriteOwnChronicles = makeOwnWriter(useWriteChroniclesByUserId);
 *
 * // Usage:
 * const { write, writeMany } = useWriteOwnChronicles();
 * await write({ title: "My Chronicle", knots: [], category: "work" });
 * ```
 */
export function makeOwnWriter<F extends (userId: string) => ReturnType<F>>(
  useWriterByUserId: F,
): () => ReturnType<F> | { write: never; writeMany: never; mutation: null } {
  return () => {
    const { data: userId } = useQuery({
      queryKey: ["dpt", "auth", "userId"],
      queryFn: async () => {
        const client = createClient();
        const {
          data: { user },
          error,
        } = await client.auth.getUser();
        if (error) throw error;
        return user?.id ?? null;
      },
      staleTime: 5 * 60_000,
    });

    // Wenn userId noch nicht geladen, gib disabled writer zurück
    if (!userId) {
      return {
        write: (() => {
          throw new Error("Auth not ready");
        }) as never,
        writeMany: (() => {
          throw new Error("Auth not ready");
        }) as never,
        mutation: null,
      };
    }

    return useWriterByUserId(userId);
  };
}

export default makeOwnWriter;
