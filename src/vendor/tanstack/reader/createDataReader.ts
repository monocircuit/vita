"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
  ArgList,
  DataReader,
  DataReaderConfig,
  NetQueryFnReturn,
  ReaderReturn,
  SlimmedData,
} from "./types";
import { getTanstackAdapter, getTanstackClient } from "../config";
import getPrimaryKey from "./getPrimaryKey";

export function createDataReader<Row extends object, Args = undefined>(
  config: DataReaderConfig<Row, Args, true>,
): DataReader<Row, Args, true>;

export function createDataReader<Row extends object, Args = undefined>(
  config: DataReaderConfig<Row, Args, false | undefined>,
): DataReader<Row, Args, false | undefined>;

export function createDataReader<
  Row extends object,
  Args = undefined,
  Single extends boolean | undefined = undefined,
>(config: DataReaderConfig<Row, Args, Single>): DataReader<Row, Args, Single> {
  return (...selector: ArgList<Args>) => {
    const queryClient = useQueryClient();
    const isAuthLoading = selector.some(s => s === "__auth_loading__");

    const queryNetworkKey = () =>
      isAuthLoading
        ? ["__disabled__", "awaiting_auth", ...config.queryBaseKey()]
        : [
            "net",
            "public",
            ...config.queryBaseKey(),
            ...config.queryNetworkKey(...selector),
          ];

    const query = useQuery<NetQueryFnReturn<Row>>({
      queryKey: queryNetworkKey(),
      queryFn: async () => {
        const client = getTanstackClient();
        const adapter = getTanstackAdapter();

        const { user, error: userError } = await adapter.getUser(client);

        if (userError) throw userError;
        if (!user) throw new Error("No user logged in");

        const fetched = await config.fetch(client, user, ...selector);
        if (!fetched) return null;

        const data: any[] = [];
        let normalizer: any = config.normalizer as any;
        if (typeof normalizer === "function") {
          normalizer = await normalizer();
        }

        fetched.forEach(row => {
          data.push(normalizer.parse(row));
        });

        return data;
      },
      enabled: !isAuthLoading && selector.every(Boolean),
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    });

    useEffect(() => {
      if (query.data && !(query.data as any)._slim) {
        for (const row of query.data as Row[]) {
          const primaryKey = getPrimaryKey(row, config.primaryKeyParts);
          const queryDepotKey = [
            "dpt",
            "public",
            ...config.queryBaseKey(),
            ...primaryKey,
          ];

          queryClient.setQueryData(queryDepotKey, () => row);
        }

        queryClient.setQueryData(queryNetworkKey(), () => {
          if (query.data) {
            const primaryKeys = [];
            for (const row of query.data as Row[]) {
              primaryKeys.push(getPrimaryKey(row, config.primaryKeyParts));
            }

            return {
              primaryKeys,
              _slim: true,
            };
          }
        });
      }
    }, [query.data, queryClient]);

    let data = queryClient.getQueryData(queryNetworkKey());

    if (data && (data as SlimmedData<Row>)._slim) {
      const primaryKeys = (data as SlimmedData<Row>).primaryKeys;
      const rows = [];

      for (const primaryKey of primaryKeys) {
        const queryDepotKey = [
          "dpt",
          "public",
          ...config.queryBaseKey(),
          ...primaryKey,
        ];
        const row = queryClient.getQueryData(queryDepotKey);
        rows.push(row);
      }

      data = config.isSingleRow ? rows[0] : rows;
    }

    return { ...query, data } as ReaderReturn<Row, Single>;
  };
}
