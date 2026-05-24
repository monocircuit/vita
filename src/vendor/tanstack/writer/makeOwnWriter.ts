"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTanstackAdapter, getTanstackClient } from "../config";

const AUTH_USER_ID_QUERY_KEY = ["dpt", "auth", "userId"] as const;

export function makeOwnWriter<F extends (userId: string) => ReturnType<F>>(
  useWriterByUserId: F,
): () => ReturnType<F> | { write: never; writeMany: never; mutation: null } {
  return () => {
    const queryClient = useQueryClient();

    useEffect(() => {
      const client = getTanstackClient();
      const adapter = getTanstackAdapter();

      if (!adapter.onAuthStateChange) {
        return;
      }

      const unsubscribe = adapter.onAuthStateChange(client, (_event, user) => {
        queryClient.setQueryData(AUTH_USER_ID_QUERY_KEY, user?.id ?? null);
      });

      return () => {
        unsubscribe();
      };
    }, [queryClient]);

    const { data: userId } = useQuery({
      queryKey: AUTH_USER_ID_QUERY_KEY,
      queryFn: async () => {
        const client = getTanstackClient();
        const adapter = getTanstackAdapter();
        const { user, error } = await adapter.getUser(client);
        if (error) throw error;
        return user?.id ?? null;
      },
      staleTime: 5 * 60_000,
    });

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
