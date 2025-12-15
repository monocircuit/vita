"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import type {
  ArgList,
  ArgsOptions,
  DataReader,
  DataReaderConfig,
  NetQueryFnReturn,
  ReaderReturn,
  SlimmedData,
} from "./types";

import { createClient } from "../../supabase/client";
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

    // Check if any selector contains the auth loading placeholder
    const isAuthLoading = selector.some(s => s === "__auth_loading__");

    // Use a descriptive placeholder key when auth is loading to avoid cache pollution
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
        const client = createClient();

        const {
          data: { user },
          error: userError,
        } = await client.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No user logged in");

        const fetched = await config.fetch(client, user, ...selector);

        if (!fetched) {
          return null;
        }

        const data: any[] = [];
        try {
          let normalizer: any = config.normalizer as any;
          if (typeof normalizer === "function") {
            normalizer = await normalizer();
          }
          fetched.forEach(row => {
            data.push(normalizer.parse(row));
          });
        } catch (err) {
          throw err;
        }

        return data;
      },

      /* Enabled logic, has to be combined with several features of the reader */
      enabled:
        /*
         * Stop the query from rerunning if the query is allocating the fetched
         * data to the base cache.
         */
        !isAuthLoading &&
        /*
         * Only execute the query function, if all selector items are provided.
         * This allows for ergonomic usage of the reader hook, as not every arg
         * can be provided at first load up.
         */
        selector.every(Boolean),

      /* Default values */
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
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

          queryClient.setQueryData(queryDepotKey, _old => {
            return row;
          });
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
    }, [query.data]);

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

        if (!row) console.warn("Data Leak; Deposit Key holds no Information");

        rows.push(row);
      }

      data = config.isSingleRow ? rows[0] : rows;
    }

    return { ...query, data } as ReaderReturn<Row, Single>;
  };
}
