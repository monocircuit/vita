"use client";

import { useQuery } from "@tanstack/react-query";
import type { DbShape, DbEnumName } from "../types";
import type { EnumReader, EnumReaderConfig, EnumReaderReturn } from "./types";
import { getTanstackClient } from "../config";

export function createEnumReader<DB extends DbShape, E extends DbEnumName<DB>>(
  config: EnumReaderConfig<E>,
): EnumReader<DB, E> {
  return () => {
    const query = useQuery<DB["public"]["Enums"][E][]>({
      queryKey: ["net", "public", "enums", ...config.queryBaseKey()],
      queryFn: async () => {
        const client = getTanstackClient();

        const { data, error } = await client.rpc("get_enum_values", {
          enum_name: config.enumName as string,
        });

        if (error) throw error;
        if (!data) return [];

        return (data as { label: string }[]).map(
          row => row.label,
        ) as DB["public"]["Enums"][E][];
      },
      staleTime: 30 * 60_000,
      gcTime: 60 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

    return query as EnumReaderReturn<DB, E>;
  };
}
